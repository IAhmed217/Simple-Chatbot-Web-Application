
function getCookie(name) {
    let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', function() {
    const chatBody = document.getElementById('chat-body');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const quickReplies = document.querySelectorAll('.quick-reply');
    const graphButton = document.getElementById('graph-button');
    const first_msg = document.getElementById('init_msg')

    function get_current_time(){
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12

        return `${hours}:${minutes} ${ampm}`;
    }

    first_msg.innerHTML = get_current_time();

    // Function to add messages
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'agent'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.textContent = content;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'time';
        
        timeDiv.innerHTML = get_current_time();
        
        if (isUser) {
            const statusSpan = document.createElement('span');
            statusSpan.className = 'message-status';
            statusSpan.innerHTML = '<i class="fas fa-check"></i>';
            
            // Simulate message being delivered after 1 second
            setTimeout(() => {
                statusSpan.innerHTML = '<i class="fas fa-check-double"></i>';
            }, 1000);
            
            timeDiv.appendChild(statusSpan);
        }
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        return messageDiv;
    }

    graphButton.addEventListener('click', () => {
        var x = document.getElementsByClassName("graph-container");
        if (x[0].style.display == "none") {
            x[0].style.display = "flex";
        } else {
            x[0].style.display = "none";
        }
    })

    // Send message on button click
    sendButton.addEventListener('click', () => {
        sendMessage();
    });

    // Also send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Send message function
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, true);
            messageInput.value = '';

            const loadDiv = document.createElement('div');
            loadDiv.className = `typing-indicator`;
            loadDiv.id = `temp-load`;
            loadDiv.style.display = 'flex';

            const spanDiv = document.createElement('span');
            const spanDiv2 = document.createElement('span');
            const spanDiv3 = document.createElement('span');
            
            setTimeout(() => {
                loadDiv.appendChild(spanDiv);
                loadDiv.appendChild(spanDiv2);
                loadDiv.appendChild(spanDiv3);

                chatBody.appendChild(loadDiv);
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 300);
            
            var postBody = { message: message, topics: []};
            quickReplies.forEach(reply=>{
                if(reply.classList.contains('selected')){
                    postBody["topics"].push(reply.textContent);
                }
            });

            try {
                const response = await fetch("/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
                    body: JSON.stringify(postBody)
                });

                const data = await response.json();
                console.log(data);
                
                // Hide typing indicator and add message
                setTimeout(() => {
                    const tempLoad = document.getElementById(`temp-load`);
                    tempLoad.remove();
                }, 300);

                addMessage(data.reply, false);

                /*
                if (data.score_graph.localeCompare("Nothing") != 0){
                    document.getElementById("graph-list").innerHTML = '';

                    var elem = document.createElement("img");
                    elem.src = data.score_graph;
                    document.getElementById("graph-list").appendChild(elem);
                    
                    elem = document.createElement("img");
                    elem.src = data.time_graph;
                    document.getElementById("graph-list").appendChild(elem);

                    elem = document.createElement("img");
                    elem.src = data.freq_graph;
                    document.getElementById("graph-list").appendChild(elem);

                    elem = document.createElement("img");
                    elem.src = data.scatter_graph;
                    document.getElementById("graph-list").appendChild(elem);
                }*/
                
            } catch (error) {
                    console.error("Error:", error);
            }
        }
    }
    
    // Quick replies functionality
    quickReplies.forEach(reply => {
        reply.addEventListener('click', () => {
            if (reply.classList.contains("selected")){
                reply.classList.remove("selected");
            } else {
                document.querySelector('.selected')?.classList.remove('selected');
                reply.classList.add('selected');
            }
        });
    });

    // Create ripple effect on buttons
    const buttons = document.querySelectorAll('.action-button, .send-button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.width = '1px';
            ripple.style.height = '1px';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'scale(0)';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.pointerEvents = 'none';
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});