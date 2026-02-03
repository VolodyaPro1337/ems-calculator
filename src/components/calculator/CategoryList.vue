<script setup lang="ts">
import type { Category, CategoryItem } from '@/types'
import CategoryCard from './CategoryCard.vue'

defineProps<{
  categories: Category[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: [category: Category]
  increment: [item: CategoryItem]
  decrement: [item: CategoryItem]
}>()
</script>

<template>
  <main class="space-y-3 w-full">
    <CategoryCard
      v-for="category in categories"
      :key="category.id"
      :category="category"
      :disabled="disabled"
      @toggle="emit('toggle', category)"
      @increment="(item) => emit('increment', item)"
      @decrement="(item) => emit('decrement', item)"
    />
  </main>
</template>
