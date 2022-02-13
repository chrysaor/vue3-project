<template>
    <h1>To-Do Page</h1>
    <div v-if="loading">
        Loading ...
    </div>
    <form
        @submit.prevent="onSave"
        v-else>
        <div class="row">
            <div class="col-6">
                <div class="form-group">
                    <label>Subject</label>
                    <input
                        v-model="todo.subject"
                        type="text"
                        class="form-control">
                </div>
            </div>
            <div class="col-6">
                <div class="form-group">
                    <label>Status</label>
                    <div>
                        <button 
                            class="btn"
                            type="button"
                            :class="todo.completed ? 'btn-success' : 'btn-danger'"
                            @click="toggleTodoStatus">
                            {{ todo.completed ? 'Completed' : 'Incompleted '}}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <button
            type="submit"
            class="btn btn-primary"
            :disabled="!todoUpdated">
            Save
        </button>
        <button
            @click="moveToTodoListPage"
            class="btn btn-outline-dark ml-2">
            Cancel
        </button>
    </form>
    <Toast
        v-if="showToast"
        :message="toastMessage"
        :type="toastAlertType"/>
</template>

<script>
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, } from 'vue';
import axios from 'axios';
import _ from 'lodash';
import Toast from '@/components/Toast.vue';
import { useToast } from '@/hooks/toast';

export default {
    components: {
        Toast
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const todo = ref(null);
        const originalTodo = ref(null);
        const loading = ref(true);
        const todoId = route.params.id;

        // Toast
        const {
            toastMessage,
            toastAlertType,
            showToast,
            triggerToast,
        } = useToast();

        const getTodo = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/todos/${todoId}`)
                todo.value = { ...res.data };
                originalTodo.value = { ...res.data };

                loading.value = false;
            } catch (err) {
                console.log(err);
                triggerToast('Something went wrong!', 'danger');                                
            }

        };

        const todoUpdated = computed(() => {
            return !_.isEqual(todo.value, originalTodo.value);
        });

        const toggleTodoStatus = () => {
            todo.value.completed = !todo.value.completed;
        };

        const moveToTodoListPage = () => {
            router.push({
                name: 'Todos'
            });
        }

        const onSave = async () => {
            try {
                const res = await axios.put(`http://localhost:3000/todos/${todoId}`, {
                    subject: todo.value.subject,
                    completed: todo.value.completed
                });

                originalTodo.value = { ...res.data };
                triggerToast('To-do object is updated!!');
            } catch (err) {
                triggerToast('Something went wrong!', 'danger');                
            }
        };

        getTodo();

        return {
            todo,
            loading,
            toggleTodoStatus,
            moveToTodoListPage,
            onSave,
            todoUpdated,
            showToast,
            toastMessage,
            toastAlertType,
        }
    }
}
</script>

<style>

</style>