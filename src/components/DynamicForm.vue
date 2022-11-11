<template>
  <q-form
    v-if="!loading && fields.length > 0"
    @submit="handleSubmit"
    @reset="$emit('onReset', $event)"
    ref="dynamicForm"
    class="row justify-center"
  >
    <!-- TODO filter fields by counter(1,2,..) that will be set based on contact field  -->

    <!-- TODO move this to another component DynamicInput -->
    <q-card
      flat
      bordered
      class="col-11 col-sm-6 col-md-5 col-xl-3"
      v-for="field in filteredFields"
      :key="field.name"
    >
      <q-card-section>
        <div class="text-h6">{{ field.label }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <component
          v-if="isRadioInput(field.fieldType)"
          :is="field.options.length > 3 ? 'q-scroll-area' : 'div'"
          visible
          :style="field.options.length > 3 ? 'height: 300px; width: 100%' : ''"
        >
          <q-list>
            <q-item
              tag="label"
              v-ripple
              v-for="option in field.options"
              :key="option.label"
            >
              <q-item-section avatar>
                <q-radio v-model="formModel[field.name]" :val="option.value" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ option.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </component>
        <q-select
          v-else-if="field.fieldType === 'select'"
          v-model="formModel[field.name]"
          :options="field.options.map((opt) => opt.value)"
          lazy-rules
          :rules="genRules(field)"
          :label="field.label"
        />
        <q-input
          v-else-if="field.fieldType === 'date'"
          filled
          v-model="formModel[field.name]"
          lazy-rules
          :rules="genRules(field)"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="formModel[field.name]" mask="MM/DD/YY">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          v-else
          filled
          :type="field.fieldType"
          v-model="formModel[field.name]"
          lazy-rules
          :rules="genRules(field)"
        />
      </q-card-section>
    </q-card>

    <div class="col-12" v-if="hasReoeatedFields && repeatedFields.length">
      <div
        v-for="n in repeatedFieldCounter"
        :key="n"
        class="row justify-center q-gutter-md"
      >
        <div class="col-12 text-h4 text-center q-py-md">
          {{ repeatedFields[0].label }} {{ n }}
        </div>
        <!-- TODO move this to another component DynamicInput -->
        <q-card
          flat
          bordered
          v-for="field in getRepeatedFieldsByIndex(n)"
          :key="field.name"
          class="col-11 col-sm-6 col-md-5 col-xl-3"
        >
          <q-card-section>
            <div class="text-h6">{{ field.label }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <component
              v-if="isRadioInput(field.fieldType)"
              :is="field.options.length > 3 ? 'q-scroll-area' : 'div'"
              visible
              :style="
                field.options.length > 3 ? 'height: 300px; width: 100%' : ''
              "
            >
              <q-list>
                <q-item
                  tag="label"
                  v-ripple
                  v-for="option in field.options"
                  :key="option.label"
                >
                  <q-item-section avatar>
                    <q-radio
                      v-model="formModel[field.name]"
                      :val="option.value"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ option.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </component>
            <q-select
              v-else-if="field.fieldType === 'select'"
              v-model="formModel[field.name]"
              :options="field.options.map((opt) => opt.value)"
              lazy-rules
              :rules="genRules(field)"
              :label="field.label"
            />
            <q-input
              v-else-if="field.fieldType === 'date'"
              filled
              v-model="formModel[field.name]"
              lazy-rules
              :rules="genRules(field)"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="formModel[field.name]" mask="MM/DD/YY">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              v-else
              filled
              :type="field.fieldType"
              v-model="formModel[field.name]"
              lazy-rules
              :rules="genRules(field)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="col-10">
      <q-btn
        v-if="hasReoeatedFields && hasNextRepeatedFields"
        :color="'secondary'"
        icon="add"
        class="q-my-md full-width"
        @click="repeatedFieldCounter++"
      />
      <q-btn
        :label="label"
        type="submit"
        color="primary"
        class="q-my-md full-width"
      />
    </div>
  </q-form>
  <q-linear-progress v-else indeterminate color="primary" />
</template>

<script lang="ts">
import { QForm } from 'quasar';
import { useHubspotApi } from 'src/factories/useHubspotApi';
// import { useLoading } from 'src/factories/useLoading';
import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import { HubFormField } from './models';
export default defineComponent({
  props: {
    // fields: {
    //   type: Object as unknown as PropType<HubFormField[]>,
    //   required: true,
    // },
    label: {
      type: String,
      default: 'Comenzar',
    },
    formId: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Object as PropType<{ [key: string]: string }>,
      default: () => ({}),
    },
    radioList: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'onSubmit', 'onReset'],
  setup(props, { emit }) {
    // const $q = useQuasar();
    const { getFormFields } = useHubspotApi();
    // const { showLoading, hideLoading } = useLoading();
    const fields = ref<HubFormField[]>([]);
    //Counter of repeated fields
    const repeatedFieldCounter = ref(1);
    const hasReoeatedFields = ref(false);
    const dynamicForm = ref<QForm>();
    const formModel = computed({
      // Use computed to wrap the object
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    });
    //This rules have to match the ones from hubspot
    const rules = {
      required: {
        message: 'Este campo es obligatorio',
        exec: (val: unknown) => val !== null && val !== '',
      },
      number: {
        message: 'El valor tiene que ser positivo',
        exec: (val: number) => val > 0,
      },
    };
    const genRules = (field: HubFormField) => {
      const result = [];
      if (field.fieldType === 'number') {
        result.push(
          (val: number) => rules.number.exec(val) || rules.number.message
        );
      }
      if (field.required) {
        result.push(
          (val: unknown) => rules.required.exec(val) || rules.required.message
        );
      }
      return result;
    };
    const getRule = (rule: 'required' | 'number') => {
      return rules[rule];
    };
    const getMask = (field: HubFormField) => {
      console.log(field.metaData[0] && field.metaData[0].value);
      return (
        field.fieldType === 'date' &&
        field.metaData[0].name === 'format' &&
        'DD/MM/YY'
      );
    };
    onMounted(async () => {
      // showLoading();
      //get form fields and generate form
      fields.value = await getFormFields(props.formId);
      hasReoeatedFields.value = !!fields.value.find(
        (f) => f.name.indexOf('_2') > -1
      );
      if (hasReoeatedFields.value) {
        //TODO check modelValue for _n fields and get the highest one
        let keys = 0;
        Object.keys(props.modelValue)
          .filter((key) => props.modelValue[key].length)
          .map((key) => {
            const foundCounter = /_(\d)/.exec(key);
            const found =
              foundCounter && foundCounter[1] ? parseInt(foundCounter[1]) : 0;
            if (found > keys) {
              keys = found;
            }
          });
        if (keys) {
          repeatedFieldCounter.value = keys;
        }
      }
      // hideLoading();
    });

    const handleSubmit = async () => {
      const valid = await dynamicForm.value?.validate();
      if (valid) {
        emit('onSubmit', props.modelValue);
      }
    };
    const isRadioInput = (fieldType: string) => {
      if (props.radioList) {
        return ['select', 'radio'].includes(fieldType);
      }
      return fieldType === 'radio';
    };

    const repeatedFields = computed(() => {
      //Filter fields , check if _\d regex
      return fields.value.filter((field) => {
        if (/_(\d)/.test(field.name)) {
          const foundCounter = /_(\d)/.exec(field.name);

          if (foundCounter && foundCounter[1]) {
            field.label = field.label.replace(foundCounter[1], '');
            return parseInt(foundCounter[1]) <= repeatedFieldCounter.value;
          }
        }
        return false;
      });
    });
    const filteredFields = computed(() => {
      return fields.value.filter(
        (field) => !hasReoeatedFields.value || !/_(\d)/.test(field.name)
      );
    });
    const hasNextRepeatedFields = computed(() => {
      return fields.value.filter((f) => {
        return f.name.indexOf(`_${repeatedFieldCounter.value + 1}`) > -1;
      }).length;
    });
    const getRepeatedFieldsByIndex = (index: number) => {
      return repeatedFields.value.filter(
        (f) => f.name.indexOf(`_${index}`) > -1
      );
    };
    return {
      fields,
      dynamicForm,
      formModel,
      hasReoeatedFields,
      repeatedFieldCounter,
      repeatedFields,
      filteredFields,
      hasNextRepeatedFields,
      genRules,
      getRule,
      handleSubmit,
      getMask,
      isRadioInput,
      getRepeatedFieldsByIndex,
    };
  },
});
</script>

<style lang="scss" scoped></style>
