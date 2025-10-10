import React, { useState, useEffect } from 'react';

function App() {
    const [name, setName] = useState('');
    const [greeting, setGreeting] = useState('');
    const [serverMessage, setServerMessage] = useState('');

    // Ambil pesan dari server (backend) saat komponen mount
    useEffect(() => {
        fetch('/api/message') // akan diteruskan ke http://localhost:5000 karena proxy
            .then(res => res.json())
            .then(data => setServerMessage(data.message))
            .catch(err => console.error('Fetch error:', err));
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        setGreeting(`Hello, ${name}!`);
    }

    return ( <
        div style = {
            { padding: 20, fontFamily: 'Segoe UI, sans-serif' } } >
        <
        h1 > PAW Praktikum 1— React(NIM: 20230140073) < /h1>

        <
        section style = {
            { marginBottom: 20 } } >
        <
        h2 > Input Nama < /h2> <
        form onSubmit = { handleSubmit } >
        <
        input type = "text"
        placeholder = "Masukkan namamu..."
        value = { name }
        onChange = {
            (e) => setName(e.target.value) }
        style = {
            { padding: 8, fontSize: 16, width: 250 } }
        /> <
        button type = "submit"
        style = {
            { marginLeft: 8, padding: '8px 12px' } } >
        Tampilkan <
        /button> <
        /form> {
            greeting && < p style = {
                    { marginTop: 12, fontSize: 18 } } > { greeting } < /p>} <
                /section>

            <
            section >
                <
                h2 > Pesan dari Server < /h2> <
                p > { serverMessage || 'Memuat pesan dari server...' } < /p> <
                /section> <
                /div>
        );
    }

    export default App;