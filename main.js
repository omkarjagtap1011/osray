document.getElementById('myForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const enrollment = document.getElementById('enrollment').value;
    const os = document.getElementById('os').value;

    // Send the data to your Node.js server for validation and storage
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, enrollment, os }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Data submitted successfully.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});