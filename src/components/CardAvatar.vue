<template>
  <q-card class="q-my-md">
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img :src="avatar" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-bold">{{ title }}</q-item-label>
        <q-item-label caption>{{ subtitle }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <slot name="left"> </slot>
      </q-item-section>
    </q-item>
    <q-card-section>
      <slot name="body"> </slot>
    </q-card-section>
    <q-card-section>
      <slot name="ctas"> </slot>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://cdn.quasar.dev/img/boy-avatar.png',
    },
  },
  setup() {
    return {};
  },
});
</script>
