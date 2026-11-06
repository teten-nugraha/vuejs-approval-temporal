import axios from 'axios'

const apiClient = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
})

export default {
    // Master User & Order
    getUsers() { return apiClient.get('/users') },
    getOrders() { return apiClient.get('/orders') },
    getOrderState(orderId) { return apiClient.get(`/orders/${orderId}`) },
    createOrder(payload) { return apiClient.post('/orders', payload) },

    // FITUR: Pick Me & Release
    claimOrder(orderId, approverId) {
        return apiClient.post(`/orders/${orderId}/claim`, { approverId })
    },
    releaseOrder(orderId, approverId) {
        return apiClient.post(`/orders/${orderId}/release`, { approverId })
    },

    // Keputusan Approval
    submitDecision(orderId, payload) {
        return apiClient.post(`/orders/${orderId}/decision`, payload)
    }
}