import { db } from 'src/boot/firebase';
import { PrivateProduct, Product } from 'src/components/models';
import { reactive, toRefs } from 'vue';

const state = reactive({
  products: <Product[]>[
    // {
    //   bad: [
    //     'aegas ser gserg srgsgsd srgsr gseg sefgse rbsrb g',
    //     'awegawe wergw bweb esr bse rb serb esrb sedrb sdrb sdrb rgserg ',
    //     'awebewb',
    //   ],
    //   good: ['aegasg', 'awegawe', 'awebewb'],
    //   ranges: ['largo', 'medio', 'corto'],
    //   types: ['hijos', 'jubilación', 'obtener rentabilidad'],
    //   name: 'title test',
    // },
  ],
});

export const ClientAreaUrls: { [key: string]: string } = {
  Aegon: ' https://www.clientes.aegon.es/login',
  Neowintech: 'https://app.secureuserarea.com/personal?lang=es&country=ES',
  Santalucía: 'https://portaldelcliente.santaluciavidaypensiones.es/',
  Caser: 'https://www.caser.es/ecliente/acceso',
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useProductsApi = () => {
  const getProductsBy = async (range: string, objective: string) => {
    try {
      const productsResponse = await db()
        .collection('products')
        .where('active', '==', true)
        .get();
      const prodData = productsResponse.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Product)
      );
      console.log('prods by objective range', range, objective);
      state.products = prodData.filter((prod) => {
        return (
          prod.persistant ||
          (prod.ranges?.includes(range) && prod.types?.includes(objective))
        );
      });
      console.log('prods', state.products, prodData);

      return prodData;
    } catch (e) {
      console.log(e);
    }
  };

  const addProduct = async (product: Product) => {
    const partialProd: Partial<Product> = { ...product };

    if (partialProd.private) {
      delete partialProd.private;
    }
    const newProdData = await db().collection('products').add(partialProd);
    if (product.private) {
      await db()
        .collection('products')
        .doc(newProdData.id)
        .collection('private')
        .doc('data')
        .set(product.private, { merge: true });
    }
    return newProdData;
  };
  //TODO update product and private collection if applied
  const updateProduct = async (data: Product) => {
    const partialProd: Partial<Product> = { ...data };

    if (data.private) {
      await db()
        .collection('products')
        .doc(data.id)
        .collection('private')
        .doc('data')
        .set(data.private, { merge: true });
      delete partialProd.private;
    }

    await db()
      .collection('products')
      .doc(data.id)
      .set(partialProd, { merge: true });
  };
  const getAllProducts = async () => {
    //TODO get private details(client name so far)
    const productsData = await db().collection('products').get();
    console.log(productsData.docs.map((p) => p.data()));
    state.products = await Promise.all(
      productsData.docs.map(async (prod) => {
        const privateData = await prod.ref
          .collection('private')
          .doc('data')
          .get();
        return {
          ...(prod.data() as Product),
          id: prod.id,
          private: privateData.data() as PrivateProduct,
        };
      })
    );
  };

  return {
    ...toRefs(state),
    getProductsBy,
    getAllProducts,
    addProduct,
    updateProduct,
  };
};
