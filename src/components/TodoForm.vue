<template>
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
                    <div
                        class="text-red"
                        v-if="subjectError">
                        {{ subjectError }}
                    </div>
                </div>
            </div>
            <div v-if="editing" class="col-6">
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
            <div class="col-12">
                <div class="form-group">
                    <label>Body</label>
                    <textarea v-model="todo.body" class="form-control" cols="30" rows="10">

                    </textarea>
                </div>
            </div>
        </div>
        <button
            type="submit"
            class="btn btn-primary mb-2"
            :disabled="!todoUpdated">
            {{ editing ? 'Update' : 'Create' }}
        </button>
        <button
            @click="moveToTodoListPage"
            class="btn btn-outline-dark ml-2 mb-2">
            Cancel
        </button>
    </form>
    <transition name="fade">
        <Toast 
            v-if="showToast" 
            :message="toastMessage"
            :type="toastAlertType"
        />
    </transition>
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
    props: {
        editing: {
            type: Boolean,
            default: false,
        }
    },
    setup(props) {
        const route = useRoute();
        const router = useRouter();
        const todo = ref({
            subject: '',
            completed: false,
            body: '',
        });
        const subjectError = ref('');
        const originalTodo = ref(null);
        const loading = ref(false);
        const todoId = route.params.id;

        // Toast
        const {
            toastMessage,
            toastAlertType,
            showToast,
            triggerToast,
        } = useToast();

        const getTodo = async () => {
            loading.value = true;

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
            subjectError.value = '';
            if (!todo.value.subject) {
                subjectError.value = 'Subject is required!';
                return;
            }


            try {
                let res;
                const data = {
                    subject: todo.value.subject,
                    completed: todo.value.completed,
                    body: todo.value.body,
                }

                if (props.editing) {
                    res = await axios.put(`http://localhost:3000/todos/${todoId}`, data);
                    originalTodo.value = { ...res.data };
                } else {
                    res = await axios.post(`http://localhost:3000/todos`, data);
                    todo.value.subject = '';
                    todo.value.body = '';
                }

                triggerToast('Request success!!');
            } catch (err) {
                triggerToast('Something went wrong!', 'danger');                
            }
        };

        if (props.editing) {
            getTodo();
        }

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
            subjectError,
        };
    }
}
</script>

<style scoped>
    .text-red {
        color: red;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: all 0.5s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
        transform: translateY(-30px);
    }

    .fade-enter-to,
    .fade-leave-from {
        opacity: 1;
        transform: translateY(0px);
    }
</style>