<template>
  <div class="">
    <q-list bordered>
      <q-item-label header>{{ title }}</q-item-label>
      <q-item v-for="(item, index) in items" :key="item">
        <q-item-section v-if="switcher" avatar>
          <div class="column">
            <q-btn
              v-if="index > 0"
              size="12px"
              flat
              dense
              round
              icon="arrow_circle_up"
              color="green"
              @click="handleSwitch(true, index)"
            ></q-btn>
            <q-btn
              v-if="index !== items.length - 1"
              size="12px"
              flat
              dense
              round
              icon="arrow_circle_down"
              color="red"
              @click="handleSwitch(false, index)"
            ></q-btn>
          </div>
        </q-item-section>
        <q-item-section>
          <slot name="body" v-bind="{ item }">
            {{ item }}
          </slot>
        </q-item-section>
        <q-item-section side>
          <q-btn
            size="12px"
            flat
            dense
            round
            icon="remove"
            color="primary"
            @click="handleRemove(index)"
          ></q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  props: {
    items: {
      type: Array as PropType<{ [key: string]: string }[]>,
      default: () => [],
    },
    title: {
      type: String,
      default: '',
    },
    switcher: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const localItems = ref(props.items);
    const handleRemove = (index: number) => {
      localItems.value.splice(index, 1);
    };

    const handleSwitch = (up: boolean, index: number) => {
      const toIndex = up ? index-- : index++;
      [localItems.value[index], localItems.value[toIndex]] = [
        localItems.value[toIndex],
        localItems.value[index],
      ];
    };
    return { handleRemove, handleSwitch };
  },
});
</script>
<style lang="scss" scoped></style>
