<script setup>
import axios from "axios";
import { ref } from "vue";

const message = ref("");
axios.get("/api/hello").then(function (response) {
  message.value = response.data.message;
});
</script>
<template>
  <div>{{ message }}</div>
</template>
