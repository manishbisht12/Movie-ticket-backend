
const registerUser = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Test User",
                email: "manibisht346@gmail.com",
                phone: "9999999999"
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Body:", JSON.stringify(data, null, 2));

    } catch (err) {
        console.error(err);
    }
};

registerUser();
