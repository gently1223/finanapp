import { Bank } from 'src/components/models';
import { reactive, toRefs } from 'vue';
import { api } from 'boot/axios';
// import { db } from 'boot/firebase';

const state = reactive({
  banks: <Bank[]>[],
  loading: false,
  bank_selected: <Bank | null>null,
  linkedBanks: <Bank[]>[],
  accounts: <
    { id: string; balance: number | null; status: string; link: string }[]
  >[],
  balances: [],
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useBanksApi = () => {
  const linkBank = async () => {
    state.loading = true;
    const linkResponse = await api.post('/link/', {
      institution_id: state.bank_selected?.id || '',
    });
    console.log(linkResponse.data);
    window.location.href = linkResponse.data as string;
    state.loading = false;
  };
  const getBanks = async () => {
    state.loading = true;

    const banksResponse = await api.post('/banks/');
    state.banks = banksResponse.data as [];
    state.loading = false;
  };
  //Returns all accounts by bank id(from nordigen)
  const getAccounts = async () => {
    state.loading = true;
    const accountsResponse = await api.get<
      {
        id: string;
        status: string;
        link: string;
        accounts: {
          id: string;
          balances: {
            balanceAmount: { amount: string; currency: string };
            balanceType: string;
          }[];
        }[];
      }[]
    >('/accounts/');
    console.log(accountsResponse.data);
    //TODO format balances o reduce
    const newAccounts = accountsResponse.data.map((bank) => {
      if (!bank.accounts.length) {
        return {
          id: bank.id,
          balance: null,
          status: bank.status,
          link: bank.link,
        };
      }
      //each bank has multiple accounts
      //each account can have multiple balances
      //get total balance in all accounts and ignore the balanceType!=information
      const totalBalance = bank.accounts.reduce((total, acc) => {
        const primaryBalance = acc.balances && acc.balances[0];
        // acc.balances.find((balance) => balance.balanceType === 'information');
        if (
          primaryBalance &&
          parseFloat(primaryBalance.balanceAmount.amount) > 0
        ) {
          total += parseFloat(primaryBalance.balanceAmount.amount);
        }
        return total;
      }, 0);
      return {
        id: bank.id,
        balance: totalBalance,
        status: bank.status,
        link: bank.link,
      };
    });
    console.log(newAccounts);
    state.accounts = newAccounts;
    // if (state.accounts.length) {
    //   await getAccountBalances(state.accounts[0]);
    // }
    state.loading = false;
  };

  // const getAccountBalances = async (account_id: string) => {
  //   state.loading = true;
  //   const balancesResponse = await api.get('/balances/', {
  //     params: { id: account_id },
  //   });
  //   console.log(balancesResponse.data);
  //   state.balances = balancesResponse.data as [];
  //   state.loading = false;
  // };

  const getBankDetails = (id: string) => {
    return state.banks.find((bank) => bank.id === id) || null;
  };

  const selectBank = (bank: Bank) => {
    state.bank_selected = bank;
  };

  return {
    ...toRefs(state),
    linkBank,
    getBanks,
    getAccounts,
    getBankDetails,
    selectBank,
  };
};
