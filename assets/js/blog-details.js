// Blog Data with real image URLs
const blogPosts = [
    {
        id: 1,
        title: "The Future of Sustainable Farming",
        excerpt: "Discover how modern technology is revolutionizing sustainable farming practices and what it means for the future of agriculture.",
        content: `
            <p>Sustainable farming is no longer just a trend—it's a necessity for our planet's future. With the global population continuing to grow, the demand for food increases while our natural resources become more limited.</p>
            <h3>Embracing Technology in Agriculture</h3>
            <p>Modern farmers are turning to innovative technologies to increase efficiency while reducing environmental impact. From precision agriculture to vertical farming, these advancements are changing the way we grow our food.</p>
            <blockquote>
                "The future of farming lies in the harmony between technology and nature, where we work with the environment rather than against it."
            </blockquote>
            <h3>Key Sustainable Practices</h3>
            <ul>
                <li>Regenerative agriculture techniques</li>
                <li>Water conservation systems</li>
                <li>Integrated pest management</li>
                <li>Renewable energy integration</li>
            </ul>
            <p>As consumers become more conscious of where their food comes from, sustainable farming practices will continue to evolve and improve.</p>
        `,
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80",
        author: "Sarah Johnson",
        date: "2024-03-15",
        category: "Sustainable Farming",
        tags: ["sustainability", "technology", "farming", "innovation"],
        comments: 12,
        readTime: 5,
        authorBio: "Sarah Johnson is a sustainable agriculture expert with over 15 years of experience in organic farming and environmental conservation."
    },
    {
        id: 2,
        title: "Organic Pest Control Methods",
        excerpt: "Learn effective and environmentally friendly ways to protect your crops from pests without harmful chemicals.",
        content: `
            <p>Organic pest control is essential for maintaining healthy crops while protecting the environment...</p>
        `,
        image: "https://images.unsplash.com/photo-1597848212624-e5d0e0e26343?auto=format&fit=crop&w=2000&q=80",
        author: "Mike Chen",
        date: "2024-03-10",
        category: "Organic Farming",
        tags: ["organic", "pest-control", "gardening", "environment"],
        comments: 8,
        readTime: 4,
        authorBio: "Mike Chen is an organic farming specialist and the founder of GreenThumb Organics, dedicated to promoting chemical-free farming practices."
    },
    {
        id: 3,
        title: "Vertical Farming: Revolutionizing Urban Agriculture",
        excerpt: "How vertical farming is bringing fresh produce to city centers and reducing the carbon footprint of food transportation.",
        content: `<p>Vertical farming is transforming how we think about urban agriculture...</p>`,
        image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=2000&q=80",
        author: "Dr. Emily Rodriguez",
        date: "2024-03-05",
        category: "Urban Farming",
        tags: ["vertical-farming", "urban", "technology", "sustainability"],
        comments: 15,
        readTime: 6,
        authorBio: "Dr. Emily Rodriguez is a leading researcher in urban agriculture and the director of the Urban Farming Innovation Center."
    },
    {
        id: 4,
        title: "Soil Health: The Foundation of Successful Farming",
        excerpt: "Understanding the importance of soil health and how to maintain fertile, productive soil for generations to come.",
        content: `<p>Healthy soil is the foundation of any successful farming operation...</p>`,
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=2000&q=80",
        author: "Robert Williams",
        date: "2024-02-28",
        category: "Soil Management",
        tags: ["soil-health", "farming", "sustainability", "agriculture"],
        comments: 6,
        readTime: 5,
        authorBio: "Robert Williams is a soil scientist with 20 years of experience in agricultural research and soil conservation practices."
    },
    {
        id: 5,
        title: "The Rise of Agri-Tech Startups",
        excerpt: "How technology startups are transforming traditional farming practices with innovative solutions.",
        content: `<p>Agriculture technology startups are bringing fresh ideas...</p>`,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80",
        author: "Lisa Thompson",
        date: "2024-02-20",
        category: "Agricultural Technology",
        tags: ["agri-tech", "innovation", "startups", "technology"],
        comments: 9,
        readTime: 4,
        authorBio: "Lisa Thompson is a technology journalist and agri-tech analyst, covering the intersection of agriculture and innovation."
    },
    {
        id: 6,
        title: "Water Conservation in Modern Agriculture",
        excerpt: "Innovative techniques and technologies that help farmers reduce water usage while maintaining crop yields.",
        content: `<p>Water scarcity is one of the biggest challenges facing modern agriculture...</p>`,
        image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=2000&q=80",
        author: "David Martinez",
        date: "2024-02-15",
        category: "Water Management",
        tags: ["water-conservation", "irrigation", "sustainability", "farming"],
        comments: 7,
        readTime: 5,
        authorBio: "David Martinez is a water resource engineer specializing in agricultural water management and conservation technologies."
    }
];

// ✅ Initialize Blog Details after loading header/footer
document.addEventListener('DOMContentLoaded', function() {
    loadComponents().then(() => {
        initializeBlogDetails();
    });
});

// ✅ Load Header and Footer Components
function loadComponents() {
    return new Promise((resolve) => {
        fetch('components/header.html')
            .then(res => res.text())
            .then(data => {
                document.getElementById('header-container').innerHTML = data;
                if (typeof initMobileNavigation === 'function') initMobileNavigation();
            })
            .catch(err => console.error('Error loading header:', err))
            .finally(() => {
                fetch('components/footer.html')
                    .then(res => res.text())
                    .then(data => {
                        document.getElementById('footer-container').innerHTML = data;
                    })
                    .catch(err => console.error('Error loading footer:', err))
                    .finally(() => resolve());
            });
    });
}

// ✅ Existing blog details logic (unchanged except wrapped after components load)
function initializeBlogDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));

    if (postId) {
        loadBlogPost(postId);
    } else {
        window.location.href = 'blog.html';
    }

    loadSidebarContent();
    setupEventListeners();
}

function loadBlogPost(postId) {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || window.blogPosts;
    const post = blogPosts.find(p => p.id === postId);

    if (!post) return (window.location.href = 'blog.html');

    document.getElementById('blog-detail-title').textContent = post.title;
    document.getElementById('blog-detail-excerpt').textContent = post.excerpt;
    document.getElementById('blog-author').innerHTML = `<i class="bi bi-person"></i> By ${post.author}`;
    document.getElementById('blog-date').innerHTML = `<i class="bi bi-calendar"></i> ${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    document.getElementById('blog-category').innerHTML = `<i class="bi bi-folder"></i> ${post.category}`;
    document.getElementById('blog-comments').innerHTML = `<i class="bi bi-chat"></i> ${post.comments} Comments`;
    document.getElementById('blog-featured-image').src = post.image;
    document.getElementById('blog-content').innerHTML = post.content;
    document.getElementById('author-bio').textContent = post.authorBio;
    document.getElementById('breadcrumb-current').textContent = post.title;

    const tagsContainer = document.getElementById('blog-tags');
    tagsContainer.innerHTML = '';
    post.tags.forEach(tag => {
        const el = document.createElement('a');
        el.href = 'blog.html';
        el.className = 'tag';
        el.textContent = tag;
        tagsContainer.appendChild(el);
    });

    loadComments(postId);
}

function loadSidebarContent() {
    loadCategories('detail-categories-list');
    loadRecentPosts('detail-recent-posts');
    loadTags('detail-tags-container');
}

function loadCategories(containerId) {
    const container = document.getElementById(containerId);
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || window.blogPosts;
    const categories = {};
    posts.forEach(p => (categories[p.category] = (categories[p.category] || 0) + 1));
    container.innerHTML = Object.entries(categories)
        .map(([c, n]) => `<li><a href="blog.html" data-category="${c}">${c}<span class="count">${n}</span></a></li>`)
        .join('');
}

function loadRecentPosts(containerId) {
    const container = document.getElementById(containerId);
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || window.blogPosts;
    container.innerHTML = posts
        .slice(0, 3)
        .map(
            p => `
        <div class="recent-post">
            <div class="recent-post-img"><img src="${p.image}" alt="${p.title}"></div>
            <div class="recent-post-content">
                <h5><a href="blog-details.html?id=${p.id}">${p.title}</a></h5>
                <span><i class="bi bi-calendar"></i> ${new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
        </div>`
        )
        .join('');
}

function loadTags(containerId) {
    const container = document.getElementById(containerId);
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || window.blogPosts;
    const tags = [...new Set(posts.flatMap(p => p.tags))];
    container.innerHTML = tags.map(t => `<a href="blog.html" class="tag">${t}</a>`).join('');
}

function loadComments(postId) {
    const comments = JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
    const container = document.getElementById('comments-container');
    const countElement = document.getElementById('comments-count');
    countElement.textContent = comments.length;

    container.innerHTML = comments.length
        ? comments
              .map(
                  c => `
        <div class="comment">
            <div class="comment-avatar">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=1000&q=80" alt="${c.name}">
            </div>
            <div class="comment-content">
                <h5>${c.name}</h5>
                <div class="comment-meta"><i class="bi bi-calendar"></i> ${new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <p>${c.text}</p>
            </div>
        </div>`
              )
              .join('')
        : `<div class="text-center py-4"><p class="text-muted">No comments yet. Be the first to comment!</p></div>`;
}

function setupEventListeners() {
    const form = document.getElementById('comment-form');
    if (form) form.addEventListener('submit', handleCommentSubmit);
}

function handleCommentSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const text = data.get('text');
    if (!text.trim()) return alert('Please enter a comment');

    const postId = parseInt(new URLSearchParams(window.location.search).get('id'));
    const comments = JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
    comments.push({
        id: Date.now(),
        name: data.get('name') || 'Anonymous',
        email: data.get('email'),
        text,
        date: new Date().toISOString()
    });
    localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));
    loadComments(postId);
    e.target.reset();
    alert('Thank you for your comment!');
}

// ✅ Store blog posts in localStorage
if (typeof blogPosts !== 'undefined') {
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
}
