const STORAGE_KEY = 'approval_order_ids'

export function getSavedOrderIds() {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : ['ORD-004']
}

export function saveOrderId(id) {
    const list = getSavedOrderIds()
    if (!list.includes(id)) {
        list.unshift(id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    }
}