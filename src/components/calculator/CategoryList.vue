<script setup lang="ts">
import type { Category, CategoryItem } from '@/types'
import CategoryCard from './CategoryCard.vue'

defineProps<{
  categories: Category[]
}>()

const emit = defineEmits<{
  toggle: [category: Category]
  increment: [item: CategoryItem]
  decrement: [item: CategoryItem]
  updateQuantity: [item: CategoryItem, value: number]
}>()
</script>

<template>
  <main class="space-y-3 w-full">
    <CategoryCard
      v-for="category in categories"
      :key="category.id"
      :category="category"
      @toggle="emit('toggle', category)"
      @increment="(item) => emit('increment', item)"
      @decrement="(item) => emit('decrement', item)"
      @update-quantity="(item, val) => emit('updateQuantity', item, val)"
    />
  </main>
</template>
