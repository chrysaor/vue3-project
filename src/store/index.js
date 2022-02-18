import { createStore } from 'vuex';

export default createStore({
    state: {
        showToast: false,
        toastMessage: '',
        toastAlertType: '',
        timeout: null,
    },
    mutations: {
        UPDATE_TOAST_MESSAGE (state, payload) {
            state.toastMessage = payload;
        },
        UPDATE_TOAST_ALERT_TYPE (state, payload) {
            state.toastAlertType = payload
        },
        UPDATE_TOAST_STATUS (state, payload) {
            state.showToast = payload;
        },
        UPDATE_TOAST_TIMEOUT (state, payload) {
            state.timeout = payload;
        },
    },
    actions: {
        triggerToast({ commit }, message, type = 'success') {
            commit('UPDATE_TOAST_MESSAGE', message);
            commit('UPDATE_TOAST_ALERT_TYPE', type);
            commit('UPDATE_TOAST_STATUS', true);

            setTimeout(() => {
                commit('UPDATE_TOAST_MESSAGE', '');
                commit('UPDATE_TOAST_ALERT_TYPE', '');
                commit('UPDATE_TOAST_STATUS', false);
            }, 5000);
        },
    },
    getters: {
        toastMessageWithSmile (state) {
            return state.toastMessage + ' ^^7';
        }
    }
});