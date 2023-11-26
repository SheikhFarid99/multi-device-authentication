const mode = 'pro'
let base_url = ''

if (mode === 'dev') {
    base_url = 'http://localhost:5000'
} else {
    base_url = ''
}

export { base_url }