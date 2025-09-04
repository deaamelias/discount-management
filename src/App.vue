<template>
  <v-app>
    <v-container>
      <div class="d-flex justify-space-between align-center mb-4">
        <div class="d-flex flex-column">
          <h2 class="font-weight-bold mb-1">Daftar Diskon</h2>
          <span
            v-if="filteredDiscounts?.length > 0"
            class="text-body-2 text-grey"
          >
            Total jumlah diskon: {{ filteredDiscounts?.length || 0 }}
          </span>
        </div>

        <div class="d-flex align-center" v-if="filteredDiscounts?.length > 0">
          <template v-if="selected.length > 0">
            <v-btn
              variant="outlined"
              class="mr-2 custom-btn red-outline-btn"
              @click="clearSelection"
              rounded="lg"
            >
              Batalkan
            </v-btn>

            <v-btn
              color="error"
              variant="outlined"
              class="mr-2 custom-btn red-btn"
              @click="confirmDialog = true"
              rounded="lg"
            >
              Hapus
            </v-btn>
          </template>

          <template v-else>
            <v-btn
              color="success"
              prepend-icon="mdi-plus"
              @click="openDialog()"
              class="btn-add custom-btn"
              rounded="lg"
            >
              Tambah diskon
            </v-btn>
          </template>
        </div>
      </div>

      <div class="d-flex align-center justify-space-between mb-8 gap-4">
        <div class="d-flex align-center gap-5">
          <v-text-field
            v-model="search"
            placeholder="Cari diskon"
            prepend-inner-icon="mdi-magnify"
            variant="plain"
            density="compact"
            clearable
            class="search-input me-4"
          />

          <v-select
            v-model="selectedOutlet"
            :items="outlets"
            prepend-inner-icon="mdi-store"
            variant="outlined"
            density="compact"
            class="outlet-select"
          />
        </div>
      </div>
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="success" size="48" />
      </div>
      <v-data-table
        v-else-if="filteredDiscounts.length > 0"
        :headers="headers"
        :items="filteredDiscounts"
        item-value="_id"
        show-select
        v-model:page="page"
        v-model="selected"
        :items-per-page="itemsPerPage"
        class="elevation-0 custom-table"
        no-data-text="Tidak ditemukan data yang cocok"
      >
        <template
          v-slot:[headers.nama]="{ column, toggleSort, isSorted, sortBy }"
        >
          <div
            class="d-flex align-center cursor-pointer"
            @click="toggleSort(column)"
          >
            <span class="mr-1">{{ column.title }}</span>
            <v-icon size="18" color="grey">
              <template v-if="isSorted && sortBy.length">
                {{
                  sortBy[0].order === "asc" ? "mdi-arrow-up" : "mdi-arrow-down"
                }}
              </template>
              <template v-else> mdi-arrow-up </template>
            </v-icon>
          </div>
        </template>
        <template v-slot:[headers.nilai]="{ column, toggleSort }">
          <div
            class="d-flex align-center cursor-pointer"
            @click="toggleSort(column)"
          >
            <span class="mr-1">{{ column.title }}</span>
            <v-icon size="18" color="grey">mdi-unfold-more-horizontal</v-icon>
          </div>
        </template>
        <template v-slot:[`item.nama`]="{ item }">
          <div class="d-flex align-center">
            <span>{{ item?.nama || "-" }}</span>
            <v-chip
              v-if="item?.isNew"
              size="x-small"
              color="primary"
              class="ml-2"
            >
              baru
            </v-chip>
          </div>
        </template>

        <template v-slot:[`item.nilai`]="{ item }">
          <span>{{ item?.nilai ?? 0 }}</span>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-icon
            size="small"
            color="grey-darken-2"
            class="cursor-pointer"
            @click="item && openDialog(item)"
          >
            mdi-pencil
          </v-icon>
        </template>
        <template #no-data>
          <div class="text-center text-gray py-4">
            Tidak ditemukan data yang cocok
          </div>
        </template>

        <template #bottom>
          <div
            class="d-flex justify-space-between align-center pa-3 table-footer"
          >
            <div class="d-flex align-center">
              <v-select
                v-model="itemsPerPage"
                :items="[10, 20, 50]"
                density="compact"
                hide-details
                variant="outlined"
                class="items-per-page-select"
              />
              <span class="ml-2 text-body-2">data per halaman</span>
            </div>

            <v-pagination
              v-model="page"
              :length="pageCount"
              total-visible="5"
              prev-icon="mdi-chevron-left"
              next-icon="mdi-chevron-right"
              class="custom-pagination"
              rounded="circle"
            />
          </div>
        </template>
      </v-data-table>

      <v-card v-else class="pa-8 text-center" outlined>
        <v-img src="./assets/diskon.png" max-width="180" class="mx-auto mb-4" />
        <h3 class="mb-2">Belum Ada Diskon</h3>
        <p class="text-gray mb-2">
          Silahkan tambah diskon untuk menarik pelanggan dan meningkatkan
          penjualan.
        </p>
        <v-btn
          color="success"
          prepend-icon="mdi-plus"
          @click="openDialog()"
          class="btn-add"
        >
          Tambah diskon
        </v-btn>
      </v-card>

      <v-dialog v-model="dialog" max-width="500">
        <v-card class="rounded-xl">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">
              {{ isEdit ? "Ubah Diskon" : "Tambah Diskon" }}
            </span>

            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="closeDialog"
            />
          </v-card-title>

          <v-card-text>
            <v-text-field
              v-model="editedItem.nama"
              label="Nama Diskon"
              placeholder="Misal: Diskon opening, diskon akhir tahun"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              :error-messages="errors.nama"
            />

            <v-row class="mb-4" align="center" dense>
              <v-col cols="7">
                <v-text-field
                  v-model="editedItem.nilai"
                  type="number"
                  label="Diskon"
                  variant="outlined"
                  density="comfortable"
                  class="d-flex align-center"
                  style="height: 40px"
                  :error-messages="errors.nilai"
                >
                  <template #append-inner>
                    <span class="append-text">
                      {{ editedItem.tipe === "persen" ? "%" : "Rp" }}
                    </span>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="5">
                <v-btn-toggle
                  v-model="editedItem.tipe"
                  mandatory
                  class="rounded-lg w-100"
                  style="height: 40px"
                >
                  <v-btn
                    value="persen"
                    size="small"
                    :class="
                      editedItem.tipe === 'persen'
                        ? 'btn-active'
                        : 'btn-default'
                    "
                  >
                    <v-icon
                      v-if="editedItem.tipe === 'persen'"
                      size="14"
                      color="success"
                      class="me-1"
                    >
                      mdi-check
                    </v-icon>
                    %
                  </v-btn>

                  <v-btn
                    value="rupiah"
                    size="small"
                    :class="
                      editedItem.tipe === 'rupiah'
                        ? 'btn-active'
                        : 'btn-default'
                    "
                  >
                    <v-icon
                      v-if="editedItem.tipe === 'rupiah'"
                      size="14"
                      color="success"
                      class="me-1"
                    >
                      mdi-check
                    </v-icon>
                    Rp
                  </v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-btn
              block
              color="success"
              variant="flat"
              class="rounded-pill"
              @click="saveDiscount"
            >
              Simpan
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="confirmDialog" max-width="480">
        <v-card class="rounded-xl">
          <v-card-title class="text-h6 font-weight-bold">
            Hapus Diskon
          </v-card-title>
          <v-card-text>
            Apakah Anda yakin ingin menghapus diskon yang dipilih? <br />
            • Diskon yang dihapus tidak bisa dikembalikan lagi.
          </v-card-text>

          <v-card-actions class="d-flex justify-end">
            <v-btn
              variant="outlined"
              class="red-outline-btn custom-btn"
              @click="confirmDialog = false"
            >
              Batal
            </v-btn>
            <v-btn class="red-btn custom-btn" @click="confirmDelete">
              Hapus
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar
        v-model="snackbar"
        :timeout="3000"
        location="top"
        color="success"
      >
        <div>{{ deletedName }} berhasil dihapus.</div>
      </v-snackbar>

      <div class="text-left mt-8 text-grey text-body-2">
        2024 © PT Nusantara Berkah Digital
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useDiscounts } from "./composables/useDiscounts";

const {
  diskons,
  loading,
  fetchDiskons,
  addDiskon,
  updateDiskon,
  deleteDiskon,
} = useDiscounts();

const errors = reactive({
  nama: "",
  nilai: "",
});

const search = ref("");
const selectedOutlet = ref("Kopi Anak Bangsa");
const outlets = ["Kopi Anak Bangsa", "Kopi Nusantara", "Warung Sejahtera"];

const itemsPerPage = ref(10);
const page = ref(1);
const pageCount = computed(() =>
  Math.ceil((diskons.value.length || 0) / itemsPerPage.value)
);

const dialog = ref(false);
const editedItem = reactive({
  _id: null,
  nama: "",
  tipe: "persen",
  nilai: 0,
  outlet: selectedOutlet.value,
});
const isEdit = ref(false);

const selected = ref([]);
const confirmDialog = ref(false);
const snackbar = ref(false);
const deletedName = ref("");

const headers = [
  { title: "Nama Diskon", key: "nama", align: "start" },
  { title: "Nilai Diskon", key: "nilai", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" },
];

function openDialog(item = null) {
  if (item) {
    Object.assign(editedItem, item);
    isEdit.value = true;
  } else {
    Object.assign(editedItem, {
      _id: null,
      nama: "",
      tipe: "persen",
      nilai: 0,
      outlet: selectedOutlet.value,
    });
    isEdit.value = false;
  }
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
}

function validateForm() {
  errors.nama = "";
  errors.nilai = "";

  if (!editedItem.nama || !editedItem.nama.trim()) {
    errors.nama = "Nama diskon tidak boleh kosong";
    return false;
  }

  const duplicate = diskons.value.find(
    (d) =>
      d.nama.toLowerCase() === editedItem.nama.toLowerCase() &&
      d._id !== editedItem._id
  );
  if (duplicate) {
    errors.nama = "Nama diskon sudah digunakan";
    return false;
  }

  if (!editedItem.nilai || Number(editedItem.nilai) <= 0) {
    errors.nilai = "Nilai diskon harus lebih dari 0";
    return false;
  }

  return true;
}

async function saveDiscount() {
  if (!validateForm()) {
    return;
  }

  const payload = {
    nama: editedItem.nama,
    tipe: editedItem.tipe,
    nilai: Number(editedItem.nilai),
    outlet: editedItem.outlet,
    createdAt: new Date().toISOString(),
  };

  if (isEdit.value && editedItem._id) {
    await updateDiskon(editedItem._id, payload);
  } else {
    await addDiskon(payload);
  }

  dialog.value = false;
  resetForm();
}

function resetForm() {
  Object.assign(editedItem, {
    nama: "",
    tipe: "persen",
    nilai: 0,
    outlet: selectedOutlet.value,
  });
  isEdit.value = false;
}

async function confirmDelete() {
  const toDelete = diskons.value.filter((d) => selected.value.includes(d._id));
  if (toDelete.length > 0) {
    deletedName.value = toDelete.map((d) => d.nama).join(", ");
    for (const item of toDelete) {
      await deleteDiskon(item._id);
    }
    selected.value = [];
    snackbar.value = true;
    confirmDialog.value = false;
  }
}

function clearSelection() {
  selected.value = [];
}

const filteredDiscounts = computed(() => {
  const all = diskons.value || [];
  return all
    .filter((d) => d && d.nama)
    .filter((d) => d.nama.toLowerCase().includes(search.value.toLowerCase()))
    .filter((d) => !selectedOutlet.value || d.outlet === selectedOutlet.value)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

onMounted(() => {
  fetchDiskons();
});
</script>

<style scoped>
.v-data-table {
  border-radius: 12px;
}

.search-input :deep(.v-field) {
  border-radius: 28px !important;
  width: 284px !important;
  height: 40px !important;
  border: 1.5px solid #9e9e9e !important;
  font-size: 14px;
}
.search-input :deep(.v-field__prepend-inner) {
  margin-left: 8px;
}

.outlet-select :deep(.v-field) {
  border-radius: 12px !important;
  width: 211px !important;
  height: 40px !important;
  font-size: 14px;
}

.btn-add {
  border-radius: 20px !important;
  min-width: 164px;
}

.append-text {
  font-weight: 600;
  color: #424242;
  padding-left: 4px;
}

.btn-active {
  background-color: #e8f5e9 !important;
  color: #2e7d32 !important;
  border: 1.5px solid #2e7d32 !important;
  font-weight: 600;
}

.btn-default {
  background-color: #fff !important;
  color: #616161 !important;
  border: 1.5px solid #bdbdbd !important;
}

:deep(.custom-table .v-data-table__th) {
  background-color: #f5f5f5 !important;
  color: #212121 !important;
  font-weight: 600;
}

:deep(.custom-table .v-data-table__td) {
  border-bottom: none !important;
}

/* Hover row */
:deep(.custom-table tbody tr:hover) {
  background-color: #fafafa !important;
}

:deep(.v-data-table .v-selection-control .mdi-checkbox-blank-outline) {
  color: #9e9e9e !important;
}

:deep(.v-data-table .v-selection-control .mdi-checkbox-marked) {
  color: #2e7d32 !important;
}

:deep(.custom-table) {
  border: 1px solid #e0e0e0 !important;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.custom-table .v-data-table__th),
:deep(.custom-table .v-data-table__td) {
  border-right: none !important;
  border-left: none !important;
  border-bottom: 1px solid #e0e0e0 !important;
}

:deep(.custom-table tbody tr:last-child .v-data-table__td) {
  border-bottom: none !important;
}

.table-footer {
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.items-per-page-select :deep(.v-field) {
  border-radius: 8px;
  height: 32px !important;
  min-width: 72px !important;
  padding: 0 8px;
  font-size: 14px;
}

:deep(.custom-pagination .v-pagination__item) {
  border-radius: 50% !important;
  min-width: 32px;
  height: 32px;
  font-size: 14px;
  color: #424242 !important;
}

:deep(.custom-pagination .v-pagination__item--active) {
  background-color: #2e7d32 !important;
  color: #fff !important;
  font-weight: 600;
}

:deep(.v-data-table_th .v-data-table-header_sort) {
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}

:deep(.v-data-table_th .v-data-table-header_sort-icon) {
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}

:deep(th[data-column-key="nilai"] .v-data-table-header__sort-icon i::before) {
  font-family: "Material Design Icons";
  content: "\F0F0C";
}

:deep(th[data-column-key="nilai"] .v-data-table-header__sort-icon i::before) {
  content: "\F0D9F";
}
.custom-btn {
  text-transform: none !important;
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 12px !important;
  font-weight: 500;
}

.red-btn {
  background-color: #ff3553 !important;
  color: white !important;
}

.red-outline-btn {
  border: 1.5px solid #ff3553 !important;
  color: #ff3553 !important;
  background-color: white !important;
}
</style>
