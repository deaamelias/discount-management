import { ref } from "vue";
import discountService from "@/api/discountService";

export function useDiscounts() {
  const diskons = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchDiskons = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await discountService.getAll();
      diskons.value = res.data;
    } catch (err) {
      console.error(err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  const addDiskon = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      await discountService.create(data);
      await fetchDiskons();
    } catch (err) {
      console.error(err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  const updateDiskon = async (id, data) => {
    loading.value = true;
    error.value = null;
    try {
      await discountService.update(id, data);
      await fetchDiskons();
    } catch (err) {
      console.error(err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDiskon = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      await discountService.delete(id);
      await fetchDiskons();
    } catch (err) {
      console.error(err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    diskons,
    loading,
    error,
    fetchDiskons,
    addDiskon,
    updateDiskon,
    deleteDiskon,
  };
}
