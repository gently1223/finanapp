import { db } from 'src/boot/firebase';
import { Objective } from 'src/components/models';
import { reactive, toRefs } from 'vue';

const state = reactive({
  objectives: <Objective[]>[],
  products: <unknown[]>[],
});
export const useObjectivesApi = () => {
  const getObjectives = async () => {
    const objectivesData = await db().collection('objectives').get();
    state.objectives = objectivesData.docs.map((objectiveData) => ({
      ...(objectiveData.data() as Objective),
      id: objectiveData.id,
    }));
  };
  const addObjective = async (objective: Omit<Objective, 'id'>) => {
    await db()
      .collection('objectives')
      .add({ ...objective });
  };
  const editObjective = async (
    id: string,
    objective: Omit<Objective, 'id'>
  ) => {
    await db()
      .collection('objectives')
      .doc(id)
      .set({ ...objective }, { merge: true });
  };
  const deleteObjective = async (id: string) => {
    await db().collection('objectives').doc(id).delete();
  };
  return {
    ...toRefs(state),
    getObjectives,
    addObjective,
    editObjective,
    deleteObjective,
  };
};
