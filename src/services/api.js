import axios from 'axios'

const apiClient = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
})

export default {
    getUsers() { return apiClient.get('/users') },
    getOrders() { return apiClient.get('/orders') },
    getOrderState(orderId) { return apiClient.get(`/orders/${orderId}`) },
    createOrder(payload) { return apiClient.post('/orders', payload) },

    claimOrder(orderId, approverId) {
        return apiClient.post(`/orders/${orderId}/claim`, { approverId })
    },
    releaseOrder(orderId, approverId) {
        return apiClient.post(`/orders/${orderId}/release`, { approverId })
    },

    submitDecision(orderId, payload) {
        return apiClient.post(`/orders/${orderId}/decision`, payload)
    },

    // FITUR CANCEL
    cancelOrder(orderId, requesterId, reason) {
        return apiClient.post(`/orders/${orderId}/cancel`, { requesterId, reason })
    }
}