// Initialize EmailJS
(function() {
    emailjs.init("81sG8_y-NShP5O-4T");
})();

function sendEmail(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Show sending status
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Replace with your EmailJS service ID and template ID
    emailjs.send("service_9b2bsge", "template_u6me1lj", {
        from_name: name,
        reply_to: email,
        message: message,
        to_email: 'davidwrogers40@gmail.com'
    })
    .then(() => {
        alert('Message sent successfully!');
        document.getElementById('contact-form').reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    })
    .catch((error) => {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });

    return false;
}


