<script>
    let navItems = ["Home", "About Us", "Projects", "Events", "Contact"];
    let upcomingEvent = {
        title: "AI Hackathon 2024",
        date: "March 15, 2024",
        location: "Tech Hub, Downtown",
        description: "A 24-hour hackathon to push the boundaries of AI innovation."
    };
	let isLoading = true;

    // Simulate loading delay (e.g., for fetching data or content)
    setTimeout(() => {
        isLoading = false;
    }, 5000); // 3-second delay for demo purposes
</script>

<style>
    .loader {
        position: fixed;      /* Fixes the div to the viewport */
        top: 0;               /* Aligns the div to the top */
        left: 0;              /* Aligns the div to the left */
        width: 100vw;         /* Makes the div cover the full width of the viewport */
        height: 100vh;        /* Makes the div cover the full height of the viewport */
        background-color: rgba(0, 0, 0);  /* Optional: semi-transparent background */
        z-index: 1000;   
    }
    .gif{
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
    }
    .content {
        display: none;
    }

    /* Show content only when it's not loading */
    :global(.loaded) {
        display: block;
    }
    :global(body) {
        margin: 0;
        font-family: 'Arial', sans-serif;
        background-color: #121212;
        color: #ffffff;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.05rem 2rem;
        background: linear-gradient(90deg, rgba(6,1,83,1) 0%, rgba(44,37,60,1) 35%, rgba(0,0,0,1) 100%);;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    nav a {
        margin: 0 0.8rem;
        color: #fff;
        text-decoration: none;
        font-size: 1.1rem;
        transition: transform 0.2s ease-in-out;
        position: relative;
    }

    nav a:hover {
        transform: scale(1.2);
    }

    nav a::after {
        content: "";
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 2px;
        background: #fff;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease-in-out;
    }

    nav a:hover::after {
        transform: scaleX(1);
    }

    .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2rem;
        background: url('/neural-net-bg.svg') center / cover no-repeat;
        height: 80vh;
    }

    .hero h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .hero p {
        font-size: 1.3rem;
    }

    section {
        padding: 2rem;
        text-align: center;
    }

    section h2 {
        margin-bottom: 1rem;
    }

    .card {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1.5rem;
    }

    .card-item {
        background: #1e1e2f;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        max-width: 300px;
        transition: transform 0.3s ease-in-out;
    }

    .card-item:hover {
        transform: translateY(-10px) scale(1.05);
    }

    footer {
        background: #1e1e2f;
        text-align: center;
        padding: 1rem;
        margin-top: 2rem;
        box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.5);
    }

    footer a {
        color: #2575fc;
        text-decoration: none;
        font-weight: bold;
    }

    footer a:hover {
        text-decoration: underline;
    }

    @media (max-width: 768px) {
        header {
            flex-direction: column;
        }

        nav a {
            margin: 0.5rem 0;
        }

        .hero h1 {
            font-size: 2.5rem;
        }

        .hero p {
            font-size: 1.1rem;
        }

        .card {
            flex-direction: column;
        }
    }
</style>
<!-- Show loading GIF while isLoading is true -->
{#if isLoading}
    <div class="loader">
        <div class="gif"><img src="/loader.gif" alt="Loading..." width="100" height="100" /></div>
    </div>
{/if}
<header>
    <img src='/logo_white.png' alt="Example Image" width="100" height="70" />
    <nav>
        {#each navItems as item}
            <a href="#" aria-label="{item}">{item}</a>
        {/each}
    </nav>
</header>

<div class="hero">
    <h1>Welcome to the AI/ML Club of MVJCE! 🌟</h1>
    <p>Exploring the frontiers of Artificial Intelligence and Machine Learning.</p>
</div>

<section>
    <h2>Our Mission 🚀</h2>
    <p>We aim to empower students and professionals to innovate using AI and ML technologies through collaboration and learning.</p>
</section>

<section>
    <h2>What We Do 🎯</h2>
    <div class="card">
        <div class="card-item">
            <h3>Workshops 🛠️</h3>
            <p>Learn practical AI/ML skills with hands-on coding sessions and tutorials.</p>
        </div>
        <div class="card-item">
            <h3>Hackathons 💡</h3>
            <p>Participate in AI-themed hackathons to create groundbreaking projects.</p>
        </div>
        <div class="card-item">
            <h3>Networking 🤝</h3>
            <p>Meet industry experts, professors, and fellow AI enthusiasts.</p>
        </div>
    </div>
</section>

<section>
    <h2>Upcoming Events 📅</h2>
    <div class="card">
        <div class="card-item">
            <h3>{upcomingEvent.title}</h3>
            <p><strong>Date:</strong> {upcomingEvent.date}</p>
            <p><strong>Location:</strong> {upcomingEvent.location}</p>
            <p>{upcomingEvent.description}</p>
        </div>
    </div>
</section>

<footer>
    <p>
        Made with ❤️ by the N3055. © 2024 |
        <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">GitHub</a>
    </p>
</footer>
