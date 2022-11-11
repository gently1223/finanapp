<template>
  <q-card :class="{ 'bg-positive': positive, 'bg-accent': accent }">
    <div class="text-white text-h6 q-pa-md">
      {{ title }}
    </div>
    <div>
      <div
        class="rounded-borders text-white"
        :class="{
          'bg-lighter-positive': positive,
          'bg-lighter-accent': accent,
        }"
      >
        <q-list class="q-py-sm">
          <q-item v-for="(feat, featI) in formatedFeatures" :key="feat.title">
            <q-item-section avatar>
              <q-avatar
                :icon="getIcon(featI, positive)"
                text-color="white"
                size="40px"
                class="bg-blackish"
              />
            </q-item-section>
            <q-item-section>
              <span
                ><b>{{ feat.prefix }}:</b>{{ feat.title }}</span
              >
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
// const icons = []
export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
    features: {
      type: Array as unknown as PropType<string[]>,
      default: () => [],
    },
    positive: {
      type: Boolean,
      default: false,
    },
    accent: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const goodIcons: string[] = ['hourglass_bottom', 'payments', 'block'],
      badIcons: string[] = ['grade', 'signal_cellular_alt', 'euro'];
    const getIcon = (iconIndex: number, isBad: boolean) => {
      if (isBad) {
        return badIcons[iconIndex];
      }
      return goodIcons[iconIndex];
    };
    const formatedFeatures = computed(() => {
      return props.features.map((feat) => {
        const elements = feat.split(':');
        return { prefix: elements[0], title: elements[1] };
      });
    });
    return { goodIcons, badIcons, formatedFeatures, getIcon };
  },
});
</script>
<style lang="scss" scoped>
.bg-lighter-accent {
  background-color: lighten($accent, 6);
}
.bg-lighter-positive {
  background-color: lighten($positive, 6);
}
.bg-blackish {
  background: rgba(0, 0, 0, 0.4);
}
</style>
