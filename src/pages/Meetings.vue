<template>
  <q-page class="">
    <div v-if="!selectedProduct" class="q-ma-md">
      <div class="text-h4 q-my-md">Tus proximas reuniones:</div>
      <q-linear-progress indeterminate v-if="loadingMeetings" />
      <div
        v-if="!loadingMeetings && !sortedMeetings.length"
        class="text-center text-h5"
      >
        Sin reuniones, agenda una con tu planificador
      </div>
      <card-avatar
        v-for="meeting in sortedMeetings"
        :key="meeting.sourceId"
        :avatar="ownerPic"
        :subtitle="formatDate(meeting.startTime)"
        :title="meeting.title"
      >
        <!-- <template #body>
          {{ meeting.body }}
        </template> -->
        <template #ctas>
          <q-btn
            label="Ir a reunion en calendario"
            :type="'a'"
            :href="meeting.externalUrl"
            target="_blank"
            color="secondary"
          />
        </template>
      </card-avatar>
    </div>
    <div ref="calendar">
      <!-- Start of Meetings Embed Script -->
      <div class="meetings-iframe-container" :data-src="dataSrc"></div>
      <!-- <script type="text/javascript" src="https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js"></script> -->
      <!-- End of Meetings Embed Script -->
    </div>
  </q-page>
</template>

<script lang="ts">
import { date } from 'quasar';
import CardAvatar from 'src/components/CardAvatar.vue';
import { useHubspotApi } from 'src/factories/useHubspotApi';
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';

export default defineComponent({
  name: 'Meetings',
  components: { CardAvatar },
  setup() {
    const {
      contact,
      meetings,
      ownerPic,
      getMeetings,
      selectedProduct,
      selectProduct,
    } = useHubspotApi();
    const ownerName = ref('');
    const loadingMeetings = ref(false);
    ownerName.value = contact.value?.hubspot_owner_name || '';
    console.log(contact.value?.hubspot_owner_name);
    const calendar = ref<HTMLDivElement>();
    const dataSrc = computed(() => {
      const ownerCalendarId = ownerName.value
        .toLowerCase()
        .split(' ')
        .join('-');
      //get all form params filled
      const params = `&firstName=${contact.value?.firstname || ''}&lastName=${
        contact.value?.lastname || ''
      }&email=${contact.value?.email || ''}&phone=${
        contact.value?.phone || ''
      }&Motivo de la reserva=${selectedProduct.value.replace(/%/g, '')}`;
      console.log(selectedProduct.value.replace(/%/g, ''));
      return `https://meetings-eu1.hubspot.com/${ownerCalendarId}?embed=true${params}`;
    });
    const sortedMeetings = computed(() => {
      return [...meetings.value]
        .filter((m) => m.startTime > new Date().getTime())
        .sort((a, b) => b.startTime - a.startTime);
    });
    onMounted(async () => {
      loadingMeetings.value = true;
      console.log(calendar.value);
      const newScript = document.createElement('script');
      newScript.setAttribute(
        'src',
        'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js'
      );
      calendar.value?.appendChild(newScript);
      await getMeetings();
      loadingMeetings.value = false;
      window.addEventListener('message', submittedForm);
    });
    onUnmounted(() => {
      console.log('unmonted');
      window.removeEventListener('message', submittedForm);
    });
    const formatDate = (millDate: number) => {
      return date.formatDate(millDate, 'dddd DD MMMM HH:mm');
    };

    const submittedForm = (event: {
      data: { meetingBookSucceeded: boolean };
    }) => {
      // console.log(event);
      if (event.data.meetingBookSucceeded) {
        selectProduct('');
        loadingMeetings.value = true;
        getMeetings().finally(() => {
          loadingMeetings.value = false;
          // console.log(err);
        });
        //refresh iframe
        refreshIframe();
      }
    };

    const refreshIframe = () => {
      const f = document.getElementsByTagName('iframe')[0];
      if (f) {
        f.src = dataSrc.value;
      }
    };

    return {
      ownerName,
      dataSrc,
      calendar,
      meetings,
      ownerPic,
      sortedMeetings,
      loadingMeetings,
      selectedProduct,
      formatDate,
    };
  },
});
</script>
