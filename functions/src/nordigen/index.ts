import express, { Express } from 'express';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import axios, { Axios } from 'axios';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { authenticate } from './middleware';

//To move-------------HUBSPOT
import Hubspot from 'hubspot';

const HUBSPOT_KEY = functions.config().hubspot.token;
const HUBSPOT_PORTAL = '25189404';

const hubspot = new Hubspot({ accessToken: HUBSPOT_KEY });

//To move------------end

const NORDIGEN_API = 'https://ob.nordigen.com/api/v2/';

export default (): Express => {
  const api = express();
  // const nordigen = new NordigenClient({
  //   secretId: NORDIGEN_ID,
  //   secretKey: NORDIGEN_KEY,
  // });
  const nordigen = axios.create({ baseURL: NORDIGEN_API });

  if (!admin.apps.length) {
    admin.initializeApp();
  }

  api.use(cors({ origin: true }));
  api.use((req, res, next) => {
    req.nordigen = nordigen;
    next();
  });
  api.get('*/test', (req, res) => {
    res.send('alive');
  });
  //TODO add authenticate and refreshNordigen as handlers to required calles
  api.get('*/accounts', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        // const id = req.query.id as string;
        // functions.logger.log('requisition id', id);
        //get user banks
        const linkedBanks = await admin
          .firestore()
          .collection('users')
          .doc(req.user_id)
          .collection('banks')
          .get();
        const allAccountsData = await Promise.all(
          linkedBanks.docs.map(async (bankDoc) => {
            const accountsResponse = await (req.nordigen as Axios).get(
              `requisitions/${bankDoc.get('ref')}/`
            );
            functions.logger.log(accountsResponse.data);
            const { link, status } = accountsResponse.data;
            //include balances here(inside accounts)
            const accounts =
              status === 'LN'
                ? await Promise.all(
                    accountsResponse.data.accounts.map(async (acc: string) => {
                      const balancesResponse = await (
                        req.nordigen as Axios
                      ).get(`accounts/${acc}/balances/`);
                      return {
                        id: acc,
                        balances: balancesResponse.data.balances,
                      };
                    })
                  )
                : [];

            return { id: bankDoc.id, link, status, accounts };
          })
        );
        // const accounts = accountsResponse.flatMap((acc) => acc.data.accounts);
        functions.logger.log('response accounts');
        functions.logger.log(allAccountsData);
        res.send(allAccountsData);
      } catch (error) {
        functions.logger.log('error', error);
        res.status(400).send('error');
      }
    });
  });
  api.get('*/details', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        const id = req.query.id as string;
        functions.logger.log('account id', id);
        const detailsResponse = await (req.nordigen as Axios).get(
          `accounts/${id}/details/`
        );
        const details = detailsResponse.data;
        functions.logger.log('details', details);
        res.send(details);
      } catch (error) {
        functions.logger.log('error', error);
        res.status(400).send('error');
      }
    });
  });
  api.get('*/transactions', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        const id = req.query.id as string;
        functions.logger.log('account id', id);
        const transactionsResponse = await (req.nordigen as Axios).get(
          `accounts/${id}/transactions/`
        );
        const transactions = transactionsResponse.data;
        functions.logger.log('transactions', transactions);
        res.send(transactions);
      } catch (error) {
        functions.logger.log('error', error);
        res.status(400).send('error');
      }
    });
  });
  api.get('*/balances', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        const id = req.query.id as string;
        functions.logger.log('account id', id);
        const balancesResponse = await (req.nordigen as Axios).get(
          `accounts/${id}/balances/`
        );
        const balances = balancesResponse.data;
        functions.logger.log('balances', balances);
        res.send(balances);
      } catch (error) {
        functions.logger.log('error', error);
        res.status(400).send('error');
      }
    });
  });

  api.post('*/banks', async (req, res) => {
    //Autenticate on FB if no token then get it and save it on FB for next calls
    authenticate(req, res, async () => {
      try {
        // Get list of institutions for spain
        // const banks = await nordigen.institution.getInstitutions('ES');

        //Get a list of institutions for spain
        const banksResponse = await (req.nordigen as Axios).get(
          'institutions/',
          {
            params: { country: 'es' },
          }
        );
        const banks = banksResponse.data;
        functions.logger.log('banks', banks);
        res.send(banks);
      } catch (error) {
        functions.logger.log('error', error);
        res.status(400).send('error');
      }
    });
  });

  api.post('*/link', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        const institution_id = req.body.institution_id;
        // Initialize new bank session
        // const init = await nordigen.initSession({
        //   redirectUrl: 'http://localhost:8080',
        //   institutionId: institution_id,
        //   referenceId: randomUUID(),
        // });

        //Create end user agreement
        const agreementResponse = await (req.nordigen as Axios).post(
          'agreements/enduser/',
          {
            institution_id,
            max_historical_days: 1,
            access_valid_for_days: 30,
            access_scope: ['balances', 'details'],
          }
        );
        functions.logger.log('agreement', agreementResponse.data);
        // const unique_id = new Date();
        //Create a link to start the process
        const urlReponse = await (req.nordigen as Axios).post('requisitions/', {
          redirect: 'https://finanfox.app/banks',
          // redirect: 'http://localhost:8080',
          institution_id,
          //TODO this must be unique on each call
          reference: randomUUID(),
          agreement: agreementResponse.data.id,
          user_language: 'ES',
        });
        functions.logger.log('url response');
        functions.logger.log(urlReponse.data);
        //TODO save init.id on FB user with the bank data
        //TODO store urlReponse.data.id in useer bank (institution_id)
        const userRef = admin.firestore().collection('users').doc(req.user_id);
        await userRef
          .collection('banks')
          .doc(institution_id)
          .set({ ref: urlReponse.data.id }, { merge: true });

        res.send(urlReponse.data.link);
      } catch (error) {
        const e = error as { response: any };
        functions.logger.log('error', e.response);
        res.status(400).send('error');
      }
    });
  });
  //************************************************************* */
  ///Move this to another folder
  api.post('*/submit', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        //format fields as hubspot expected
        const fields = Object.keys(req.body).reduce<
          { name: string; value: string }[]
        >((result, key) => {
          result.push({ name: key, value: req.body[key] });
          return result;
        }, []);
        //If not email is provided then use the logged user
        if (!req.body.email) {
          fields.push({ name: 'email', value: req.email });
        } else {
          try {
            //if email is provided then is referral, check if email exist and contains referido_por
            const contactRespnse: {
              vid: number;
              properties: {
                referido_por: { value: string };
                [key: string]: { value: string };
              };
            } = await hubspot.contacts.getByEmail(req.body.email);
            //Email already refered
            if (contactRespnse.properties.referido_por) {
              res.status(404).send('Usuario ya fué referido');
              return;
            }
          } catch (error) {
            //Referred user does not exist yet, no problem, it will be created after this form submit
            functions.logger.log(
              'err no user yet or user already exist, is ok ',
              error
            );
          }
          //create firebase user, at this stage the referred user will be created on hubspot so we need a firebase user to let them enter the app
          const newFbUser = await admin
            .auth()
            .createUser({ email: req.body.email });
          functions.logger.log('new user', newFbUser.passwordHash);
        }
        functions.logger.log('submit', fields);
        await hubspot.forms.submit(HUBSPOT_PORTAL, req.query.id as string, {
          fields,
        });
        res.send('ok');
      } catch (error) {
        const e = error as { message: string };
        functions.logger.log('error', error);
        //TODO try to extract message here
        const message =
          (e && e.message) ||
          'Ha ocurrido un error, vuelva a intentarlo o contacte con nuestro equipo';
        res.status(400).send({ message });
      }
    });
  });

  api.get('*/form', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        functions.logger.log('form id', req.query.id);
        const formRespnse = await hubspot.forms.getById(req.query.id as string);
        functions.logger.log('form', formRespnse);

        res.send(formRespnse);
      } catch (error) {
        functions.logger.log('error', error);
        res.send('error');
      }
    });
  });

  api.get('*/contact', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        functions.logger.log('email', req.email);
        const contactRespnse: {
          properties: {
            hubspot_owner_id: { value: string };
            [key: string]: { value: string };
          };
        } = await hubspot.contacts.getByEmail(req.email);
        // functions.logger.log('contact', contactRespnse);
        const ownerId = contactRespnse.properties.hubspot_owner_id.value;
        const ownerRespnse = await hubspot.owners.getById(ownerId);
        // functions.logger.log('owner', ownerRespnse);
        //get the contact related to the owner so we can get the google calendar id
        const ownerDataRespnse: {
          properties: {
            hs_avatar_filemanager_key: { value: string };
            zoom: { value: string };
            calendario: { value: string };
          };
        } = await hubspot.contacts.getByEmail(ownerRespnse.email);
        // const a = Object.keys(contactRespnse.properties).reduce((res, value)=>{
        // },{})
        res.send({
          ...contactRespnse.properties,
          hubspot_owner_name: {
            value: `${ownerRespnse.firstName} ${ownerRespnse.lastName}`,
          },
          hubspot_owner_email: {
            value: ownerRespnse.email,
          },
          hubspot_owner_avatar: {
            value: ownerDataRespnse.properties.hs_avatar_filemanager_key.value,
          },
          hubspot_owner_calendar: {
            value: ownerDataRespnse.properties.calendario.value,
          },
        });
      } catch (error) {
        functions.logger.log('error', error);
        res.status(400).send('error');
      }
    });
  });
  //Search list of contacts which accepts a list of properties and values and from which index(after)
  api.post('*/contacts', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        functions.logger.log('email', req.email);
        functions.logger.log('is admin', req.admin);
        if (!req.admin) {
          throw new Error('Not an admin');
        }
        const filters = req.body.filters;
        functions.logger.log('filters', filters);
        const ownersRespnse = await hubspot.owners.get();
        //TODO filter owners by email to get the owner id
        const owner = ownersRespnse.find(
          (o: { email: string }) => o.email === req.email
        );
        functions.logger.log('owner', owner);
        if (!owner) {
          throw new Error('Not an owner');
        }
        //TODO search contacts by owner and extra filters
        const requestBody: { [key: string]: unknown } = {
          limit: 100,
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'hubspot_owner_id',
                  operator: 'EQ',
                  value: owner.ownerId,
                },
                {
                  propertyName: 'lifecyclestage',
                  operator: 'EQ',
                  value: 'customer',
                },
              ],
            },
          ],
        };
        if (req.body.after) {
          requestBody.after = req.body.after;
        }
        if (filters) {
          requestBody.query = filters;
        }
        const searchResponse: {
          results: { properties: { email: string; fb_id?: string } }[];
        } = await hubspot.apiRequest({
          method: 'POST',
          path: '/crm/v3/objects/contacts/search',
          body: requestBody,
        });
        functions.logger.log('search', searchResponse.results);
        //TODO compare with users in firebase to check if already created or not
        //compare each user form hubspot
        searchResponse.results = await Promise.all(
          searchResponse.results.map(async (contact) => {
            try {
              const user = await admin
                .auth()
                .getUserByEmail(contact.properties.email);
              return {
                ...contact,
                properties: { ...contact.properties, fb_id: user.uid },
              };
            } catch (error) {
              functions.logger.log('no user error', contact.properties);
              return contact;
            }
          })
        );
        res.send(searchResponse);
      } catch (error) {
        functions.logger.log('error', error);
        res.status(400).send('error');
      }
    });
  });
  //Creates a new user and send reset password
  api.post('*/user', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        if (!req.admin) {
          throw new Error('Not an admin');
        }
        await admin.auth().createUser({ email: req.body.email });

        res.send('ok');
      } catch (e) {
        functions.logger.log('error', e);
        res.status(400).send('error');
      }
    });
  });
  //Send reset pass
  api.post('*/reset', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        if (!req.admin) {
          throw new Error('Not an admin');
        }

        const link = await admin
          .auth()
          .generatePasswordResetLink(req.body.email, {
            url: 'https://finanfox.app',
          });
        //Update hubspot contact reset_pass_url
        functions.logger.log('link', link);
        await hubspot.contacts.updateByEmail(req.body.email, {
          properties: [{ property: 'reset_pass_url', value: link }],
        });
        res.send(link);
      } catch (e) {
        functions.logger.log('error', e);
        res.status(400).send('error');
      }
    });
  });
  api.post('*/valid', async (req, res) => {
    try {
      functions.logger.log('email', req.body.email);

      await hubspot.contacts.getByEmail(req.body.email);
      res.send(true);
    } catch (error) {
      res.status(403).send('Not user recognized');
    }
  });
  api.post('*/contact', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        const fields = Object.keys(req.body).reduce<
          { property: string; value: string }[]
        >((result, key) => {
          result.push({ property: key, value: req.body[key] });
          return result;
        }, []);
        functions.logger.log('email', req.email);
        functions.logger.log('body', fields);
        const updatedContact = await hubspot.contacts.updateByEmail(req.email, {
          properties: fields,
        });
        functions.logger.log('updated contact', updatedContact);
        res.send(updatedContact);
      } catch (e) {
        res.status(400).send(e);
      }
    });
  });
  api.get('*/referrals', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        functions.logger.log('referido por', req.email);
        //TODO get referidos from this user and then get deals for those referidos
        const contactRespnse: {
          vid: number;
          properties: {
            referidos: { value: string };
            [key: string]: { value: string };
          };
        } = await hubspot.contacts.getByEmail(req.email);

        const referidos = contactRespnse.properties.referidos?.value
          ? contactRespnse.properties.referidos.value.split('\n')
          : [];
        functions.logger.log('all referidos', referidos);

        const referralsDeals = await Promise.all(
          referidos.map(async (refer) => {
            try {
              const contactRespnse: {
                vid: number;
              } = await hubspot.contacts.getByEmail(refer);
              const endpoint = `https://api.hubapi.com/crm-associations/v1/associations/${contactRespnse.vid}/HUBSPOT_DEFINED/4`;
              const assResponse: { results: number[] } =
                await hubspot.apiRequest({
                  method: 'GET',
                  overlapUrl: endpoint,
                });
              const dealsResponse: { properties: string }[] = await Promise.all(
                assResponse.results.map(async (dealId) => {
                  return await hubspot.apiRequest({
                    method: 'GET',
                    path: `/deals/v1/deal/${dealId}`,
                  });
                })
              );
              return { deals: dealsResponse, refered: refer };
            } catch (error) {
              return { deals: [], refered: refer };
            }
          })
        );

        functions.logger.log('DEALS');
        functions.logger.log(referralsDeals);
        // const businessResponse = await hubspot.deals.
        res.send(referralsDeals);
      } catch (error) {
        functions.logger.log('error', error);
        res.send('error');
      }
    });
  });
  api.get('*/owner', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        functions.logger.log('owner id', req.query.id);
        const ownerRespnse = await hubspot.owners.getById(
          req.query.id as string
        );
        functions.logger.log('owner', ownerRespnse);

        res.send(ownerRespnse);
      } catch (error) {
        functions.logger.log('error', error);
        res.send('error');
      }
    });
  });
  //Get all user meetings from hubspot
  api.get('*/meeting', async (req, res) => {
    authenticate(req, res, async () => {
      try {
        functions.logger.log('data', req.body);
        //get contact by email
        const contactRespnse: {
          vid: number;
        } = await hubspot.contacts.getByEmail(req.email);
        //get associations byt objectId(userId) and definitionId=9(engagements)
        const endpoint = `https://api.hubapi.com/crm-associations/v1/associations/${contactRespnse.vid}/HUBSPOT_DEFINED/9?limit=100`;

        const assResponse: { results: number[] } = await hubspot.apiRequest({
          method: 'GET',
          overlapUrl: endpoint,
        });
        functions.logger.log('associations', assResponse);
        //get hubspot engagements by id
        const meetingsResponse = await Promise.all(
          assResponse.results.map(async (meetingId) => {
            return await hubspot.apiRequest({
              method: 'GET',
              path: `/engagements/v1/engagements/${meetingId}`,
            });
          })
        );
        functions.logger.log('MEETINGS');
        functions.logger.log(meetingsResponse);

        res.send(meetingsResponse);
      } catch (e) {
        functions.logger.log('error', e);
      }
    });
  });
  // api.post('*/meeting', async (req, res) => {
  //   authenticate(req, res, async () => {
  //     try {
  //       functions.logger.log('data', req.body);
  //       const engagementRequest = {
  //         engagement: {
  //           active: true,
  //           ownerId: 0, //from body(owner)
  //           type: 'MEETING',
  //           bodyPreview: 'from body request', //(title)
  //         },
  //         associations: {
  //           contactIds: [0], //from body request(contact)
  //         },
  //         metadata: {
  //           startTime: 0, //miiliseconds from body request(start)
  //           endTime: 0, //miiliseconds from body request(end)
  //           body: 'from body request', //(description)
  //           title: 'from body request', //(title)
  //         },
  //       };
  //       //TODO create google calendar event and zoom call with owner email
  //       const meetingRespnse = await hubspot.engagements.create(
  //         engagementRequest
  //       );
  //       functions.logger.log('meeting', meetingRespnse);

  //       res.send(meetingRespnse);
  //     } catch (error) {
  //       functions.logger.log('error', error);
  //       res.send('error');
  //     }
  //   });
  // });
  // api.post('*/meeting', async (req, res) => {
  //   authenticate(req, res, async () => {
  //     try {
  //       functions.logger.log('data', req.body);
  //       //Get owner contact properties
  //       const ownerContactRespnse: {
  //         properties: {
  //           hs_avatar_filemanager_key: { value: string };
  //           zoom: { value: string };
  //           calendario: { value: string };
  //         };
  //       } = await hubspot.contacts.getByEmail(req.body.email);
  //       functions.logger.log(
  //         'owner',
  //         ownerContactRespnse.properties.calendario
  //       );
  //       //get this from req.body(owner email)
  //       const GOOGLE_CALENDAR_ID =
  //         ownerContactRespnse.properties.calendario.value || req.body.email;
  //       functions.logger.log('calednar id', GOOGLE_CALENDAR_ID);

  //       const jwtClient = new auth.JWT(
  //         GOOGLE_CLIENT_EMAIL,
  //         'finanzapp-2022.json',
  //         undefined,
  //         SCOPES
  //       );

  //       const calendarObj = calendar({
  //         version: 'v3',
  //         // project: GOOGLE_PROJECT_NUMBER,
  //         auth: jwtClient,
  //       });
  //       //insert the calendar(no need to check if already exist only need to be invited first)
  //       const test = await calendarObj.calendarList.insert({
  //         requestBody: {
  //           id: GOOGLE_CALENDAR_ID,
  //         },
  //       });
  //       functions.logger.log('AFTER CALENDAR INSERT');
  //       functions.logger.log(test.data);
  //       const a = await calendarObj.calendarList.list();
  //       functions.logger.log('ALL CALENDAR IN THE SERVICE ACCOUNT');
  //       functions.logger.log(a.data);
  //       //TODO create the event with req.body params(title, description with zoom meeting, start date, end date)
  //       const meetingRes = await calendarObj.events.insert({
  //         calendarId: GOOGLE_CALENDAR_ID,
  //         sendUpdates: 'all',
  //         requestBody: {
  //           // visibility: 'public',
  //           attendees: [{ email: req.email }],
  //           description: 'some test description',
  //           summary: 'some test title',
  //           start: {
  //             dateTime: new Date().toISOString(),
  //             timeZone: 'Europe/Madrid',
  //           },
  //           end: {
  //             dateTime: new Date('2022-09-15').toISOString(),
  //             timeZone: 'Europe/Madrid',
  //           },
  //         },
  //       });

  //       // const meetingRes = await calendarObj.events.list({
  //       //   calendarId: GOOGLE_CALENDAR_ID,
  //       //   timeMin: new Date().toISOString(),
  //       //   maxResults: 10,
  //       // });
  //       functions.logger.log('meeting', meetingRes.data);

  //       res.send(meetingRes);
  //     } catch (error) {
  //       functions.logger.log('error', error);
  //       res.status(400).send(JSON.stringify({ error: error }));
  //     }
  //   });
  // });
  //************************************************************* */

  return api;
};
