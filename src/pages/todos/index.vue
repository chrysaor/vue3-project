<template>
  <div>
    <div class="d-flex justify-content-between mb-3">
      <h2>To-Do List</h2>
      <button
        @click="moveToCreatePage"
        class="btn btn-primary">
        Create Todo
      </button>
    </div>
    <input
        class="form-control"
        type="text"
        v-model="searchText"
        placeholder="Search"
        @keyup.enter="searchTodo"
    >
    <hr />

    <div v-if="!todos.length">
      There is nothing to display.
    </div>

    <TodoList 
      :todos="todos"
      @toggle-todo="toggleTodo"
      @delete-todo="deleteTodo"
    />

    <hr />
    <Pagintation
      v-if="todos.length"
      :numberOfPages="numberOfPages"
      :currentPage="currentPage"
      @click="getTodos"
    />

  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import TodoList from '@/components/TodoList.vue';
import axios from '@/axios';
import { useToast } from '@/composables/toast';
import { useRouter } from 'vue-router';
import Pagintation from '@/components/Pagination.vue';

export default {
  components: {
    TodoList,
    Pagintation,
  },
  setup() {
    const router = useRouter()
    const todos = ref([]);
    const error = ref('');
    const numberOfTodos = ref(0);
    const limit = 5;
    const currentPage = ref(1);
    const searchText = ref('');

    const {
      toastMessage,
      toastAlertType,
      showToast,
      triggerToast,
    } = useToast();

    const numberOfPages = computed(() => {
      return Math.ceil(numberOfTodos.value/limit);
    });

    const getTodos = async (page = currentPage.value) => {
      currentPage.value = page;
      try {
        const res = await axios.get(
          `todos?subject_like=${searchText.value}&_page=${page}&_limit=${limit}&_sort=id&_order=desc`
        );
        numberOfTodos.value = res.headers['x-total-count'];
        todos.value = res.data;
      } catch (err) {
        console.log(err);
        error.value = 'Something went wrong.';
        triggerToast('Something went wrong', 'danger');
      }
    };

    getTodos();

    const addTodo = async (todo) => {
      error.value = '';
      try {
        await axios.post(`todos`, {
          subject: todo.subject,
          completed: todo.completed,
        });

        getTodos(1);
      } catch (err) {
        err.value = 'Something went wrong.';
        triggerToast('Something went wrong', 'danger');
      }
    };

    const deleteTodo = async (id) => {
      error.value = '';

      try {
        await axios.delete(
          `todos/${id}`
        );

        getTodos(1);
      } catch (err) {
        error.value = 'Something went wrong.';
        triggerToast('Something went wrong', 'danger');
      }
    };

    const toggleTodo = async (index, checked) => {
        console.log(checked);
        error.value = '';
        const id = todos.value[index].id;
      try {
        await axios.patch(`todos/${id}`, {
          completed: checked
        })
        todos.value[index].completed = checked
      } catch (err) {
        error.value = 'Something went wrong.';
        triggerToast('Something went wrong', 'danger');
      }
    };

    const moveToCreatePage = () => {
      router.push({
        name: 'TodoCreate'
      })
    };

    let timeout = null;

    const searchTodo = () => {
      clearTimeout(timeout);
      getTodos(1);
    };

    watch(searchText, () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        getTodos(1);
      }, 2000);
    });

    return {
      todos,
      addTodo,
      getTodos,
      deleteTodo,
      toggleTodo,
      searchText,
      searchTodo,
      error,
      numberOfPages,
      currentPage,
      showToast,
      toastMessage,
      toastAlertType,
      triggerToast,
      moveToCreatePage,
    };
  }
}
</script>

<style>
  .todo {
    color: gray;
    text-decoration: line-through;
  }
</style>