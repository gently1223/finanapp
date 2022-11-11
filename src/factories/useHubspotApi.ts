/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { computed, reactive, toRefs } from 'vue';
import { api } from 'boot/axios';
import {
  Contact,
  FormOnboarding,
  HubFormField,
  Meeting,
  MeetingResponse,
} from 'src/components/models';

const state = reactive({
  contact: <Contact | null>null,
  contacts: <Contact[]>[],
  total_contacts: 0,
  meetings: <Meeting[]>[],
  imagePrefix: 'https://25189404.fs1.hubspotusercontent-eu1.net/hub/25189404/',
  selectedProduct: '',
  loading: false,
  referralsDeals: <
    {
      deals: { properties: { [key: string]: { value: string } } }[];
      refered: string;
    }[]
  >[],
});

interface Form {
  formFieldGroups: {
    fields: HubFormField[];
  }[];
}

interface FormFields {
  [key: string]: unknown;
}
export const FORMS = {
  referral: '471be70b-0bb4-4189-8dee-4e94df2f9042',
  contact: '30c61a46-e6d2-4c16-95d9-e70ba22f1141',
  onboarding: 'e29b4a8d-2a45-4b28-9b26-f0c9f49bf521',
  products: 'a1f6a213-ffc9-4e2f-9243-4953fd908230',
  objectives: '48a11ee2-c38b-4fc6-9156-d491aaba052b',
  family: 'ed64485c-9674-4537-a90c-abcee2cb09e7',
  properties: 'd40e0b2b-dcaf-4307-8903-e0219b5bbe45',
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useHubspotApi = () => {
  const getFormFields = async (formId: string) => {
    state.loading = true;
    const formResponse = await api.get('/form/', { params: { id: formId } });
    console.log('get form response', formResponse);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const form = formResponse.data as Form;
    const fields = form.formFieldGroups
      .reduce<HubFormField[]>((result, value) => {
        if (value.fields.length) {
          result.push(...value.fields);
        }
        return result;
      }, [])
      .filter((field) => !field.hidden);
    console.log(fields);
    state.loading = false;
    return fields;
  };
  const submitForm = async (
    formId: string,
    fields: FormOnboarding | FormFields
  ) => {
    console.log(fields);
    try {
      const submittedResponse = await api.post('/submit/', fields, {
        params: { id: formId },
      });
      console.log(submittedResponse);
      return null;
    } catch (e) {
      console.log(e);
      const a = e as { response: { data: { message: string } } };
      return a.response.data;
    }
  };
  const contactExists = async (email: string) => {
    try {
      await api.post('/valid/', { email });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
  const getContact = async () => {
    try {
      const contactResponse = await api.get('/contact/');
      console.log(contactResponse);
      const props = contactResponse.data as {
        [key: string]: { value: string };
      };
      state.contact = Object.keys(props).reduce((result: Contact, key) => {
        result[key] = props[key].value;
        return result;
      }, {} as Contact);
      return contactResponse.data as Contact;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  const getMeetings = async () => {
    //TODO to create a meeting we need to update the user probably
    const meetingsResponse = await api.get<MeetingResponse[]>('/meeting/');
    console.log(meetingsResponse.data);
    state.meetings = meetingsResponse.data
      .filter((el) => !!el.metadata.sourceId)
      .map((el) => el.metadata);
    return state.meetings;
  };
  const createMeeting = async (ownerEmail: string) => {
    //TODO to create a meeting we need to update the user probably
    const submittedResponse = await api.post('/meeting/', {
      email: ownerEmail,
    });
    console.log(submittedResponse);
  };
  const updateContact = async (data: unknown) => {
    try {
      const submittedResponse = await api.post('/contact/', data);
      console.log(submittedResponse);
    } catch (e) {
      console.log(e);
    }
  };
  const getReferralDeals = async () => {
    state.loading = true;
    const dealsResponse = await api.get<
      {
        deals: { properties: { [key: string]: { value: string } } }[];
        refered: string;
      }[]
    >('/referrals/');
    if (dealsResponse.data.length > 0) {
      state.referralsDeals = dealsResponse.data;
    }
    state.loading = false;
  };
  const getOwnerContacts = async (query?: string) => {
    state.loading = true;
    const contactResponse = await api.post<{
      results: { properties: { [key: string]: string }; client?: boolean }[];
      total: number;
      paging?: { next: { after: number } };
    }>('/contacts/', { filters: query });
    // {
    //   filters: [{ name: 'some_property', value: 'test' }],
    //   after: 100,
    // }
    console.log(contactResponse.data);
    state.contacts = contactResponse.data.results.map((contact) => {
      const props = contact.properties;
      const newContact = Object.keys(props).reduce((result: Contact, key) => {
        result[key] = props[key];
        return result;
      }, {} as Contact);
      if (contact.client) {
        newContact.client = true;
      }
      return newContact;
    });
    state.loading = false;
  };

  const ownerPic = computed(() => {
    return `${state.imagePrefix}${state.contact?.hubspot_owner_avatar || ''}`;
  });
  const referrals = computed(() => {
    const refers = state.contact?.referidos;
    if (refers) {
      return refers.split('\n');
    }
    return [];
  });

  const selectProduct = (title: string) => {
    state.selectedProduct = title;
  };

  return {
    ...toRefs(state),
    ownerPic,
    referrals,
    getFormFields,
    submitForm,
    getContact,
    createMeeting,
    updateContact,
    getMeetings,
    selectProduct,
    getReferralDeals,
    contactExists,
    getOwnerContacts,
  };
};
