// Blog Data with real image URLs
const blogPosts = [
    {
        id: 1,
        title: "The Future of Sustainable Farming",
        excerpt: "Discover how modern technology is revolutionizing sustainable farming practices and what it means for the future of agriculture.",
        content: `
            <p>Sustainable farming is no longer just a trend—it's a necessity for our planet's future...</p>
        `,
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80",
        author: "Sarah Johnson",
        date: "2024-03-15",
        category: "Sustainable Farming",
        tags: ["sustainability", "technology", "farming", "innovation"],
        comments: 12,
        readTime: 5
    },
    {
        id: 2,
        title: "Organic Pest Control Methods",
        excerpt: "Learn effective and environmentally friendly ways to protect your crops from pests without harmful chemicals.",
        content: `
            <p>Organic pest control is essential for maintaining healthy crops...</p>
        `,
        image: "https://images.unsplash.com/photo-1597848212624-e5d0e0e26343?auto=format&fit=crop&w=2000&q=80",
        author: "Mike Chen",
        date: "2024-03-10",
        category: "Organic Farming",
        tags: ["organic", "pest-control", "gardening", "environment"],
        comments: 8,
        readTime: 4
    },
    {
        id: 3,
        title: "Vertical Farming: Revolutionizing Urban Agriculture",
        excerpt: "How vertical farming is bringing fresh produce to city centers and reducing the carbon footprint of food transportation.",
        content: `
            <p>Vertical farming is transforming how we think about urban agriculture...</p>
        `,
        image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=2000&q=80",
        author: "Dr. Emily Rodriguez",
        date: "2024-03-05",
        category: "Urban Farming",
        tags: ["vertical-farming", "urban", "technology", "sustainability"],
        comments: 15,
        readTime: 6
    },
    {
        id: 4,
        title: "Soil Health: The Foundation of Successful Farming",
        excerpt: "Understanding the importance of soil health and how to maintain fertile, productive soil for generations to come.",
        content: `
            <p>Healthy soil is the foundation of any successful farming operation...</p>
        `,
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=2000&q=80",
        author: "Robert Williams",
        date: "2024-02-28",
        category: "Soil Management",
        tags: ["soil-health", "farming", "sustainability", "agriculture"],
        comments: 6,
        readTime: 5
    },
    {
        id: 5,
        title: "The Rise of Agri-Tech Startups",
        excerpt: "How technology startups are transforming traditional farming practices with innovative solutions.",
        content: `
            <p>Agriculture technology startups are bringing fresh ideas...</p>
        `,
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80",
        author: "Lisa Thompson",
        date: "2024-02-20",
        category: "Agricultural Technology",
        tags: ["agri-tech", "innovation", "startups", "technology"],
        comments: 9,
        readTime: 4
    },
    {
        id: 6,
        title: "Water Conservation in Modern Agriculture",
        excerpt: "Innovative techniques and technologies that help farmers reduce water usage while maintaining crop yields.",
        content: `
            <p>Water scarcity is one of the biggest challenges facing modern agriculture...</p>
        `,
        image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=2000&q=80",
        author: "David Martinez",
        date: "2024-02-15",
        category: "Water Management",
        tags: ["water-conservation", "irrigation", "sustainability", "farming"],
        comments: 7,
        readTime: 5
    }
];

// Initialize Blog with Header & Footer loading
document.addEventListener('DOMContentLoaded', function() {
    loadComponents().then(() => {
        initializeBlog();
        setupEventListeners();
    });
});

// Load Header and Footer Components
function loadComponents() {
    return new Promise((resolve) => {
        fetch('components/header.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('header-container').innerHTML = data;
                if (typeof initMobileNavigation === 'function') {
                    initMobileNavigation();
                }
            })
            .catch(error => console.error('Error loading header:', error))
            .finally(() => {
                fetch('components/footer.html')
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById('footer-container').innerHTML = data;
                    })
                    .catch(error => console.error('Error loading footer:', error))
                    .finally(() => resolve());
            });
    });
}

// Core Blog Functions
function initializeBlog() {
    loadBlogPosts();
    loadCategories();
    loadRecentPosts();
    loadTags();
}

function loadBlogPosts() {
    const container = document.getElementById('blog-posts-container');
    const postsToShow = blogPosts.slice(0, 6);
    container.innerHTML = '';
    postsToShow.forEach(post => container.appendChild(createBlogPostElement(post)));
    updateLoadMoreButton();
}

function createBlogPostElement(post) {
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const col = document.createElement('div');
    col.className = 'col-md-6';
    col.innerHTML = `
        <article class="blog-post" data-aos="fade-up">
            <div class="blog-card">
                <div class="blog-card-img">
                    <img src="${post.image}" alt="${post.title}" onerror="this.src='https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80'">
                </div>
                <div class="blog-card-body">
                    <div class="blog-card-meta">
                        <span><i class="bi bi-person"></i> ${post.author}</span>
                        <span><i class="bi bi-calendar"></i> ${formattedDate}</span>
                    </div>
                    <h3 class="blog-card-title"><a href="blog-details.html?id=${post.id}">${post.title}</a></h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <div class="blog-card-footer">
                        <a href="blog-details.html?id=${post.id}" class="read-more">Read More <i class="bi bi-arrow-right"></i></a>
                        <span class="text-muted small"><i class="bi bi-clock"></i> ${post.readTime} min read</span>
                    </div>
                </div>
            </div>
        </article>`;
    return col;
}

function loadCategories() {
    const list = document.getElementById('categories-list');
    const categories = {};
    blogPosts.forEach(post => categories[post.category] = (categories[post.category] || 0) + 1);
    list.innerHTML = '';
    Object.entries(categories).forEach(([cat, count]) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" data-category="${cat}">${cat}<span class="count">${count}</span></a>`;
        list.appendChild(li);
    });
}

function loadRecentPosts() {
    const container = document.getElementById('recent-posts');
    container.innerHTML = '';
    blogPosts.slice(0, 3).forEach(post => container.appendChild(createRecentPostElement(post)));
}

function createRecentPostElement(post) {
    const date = new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const div = document.createElement('div');
    div.className = 'recent-post';
    div.innerHTML = `
        <div class="recent-post-img"><img src="${post.image}" alt="${post.title}"></div>
        <div class="recent-post-content">
            <h5><a href="blog-details.html?id=${post.id}">${post.title}</a></h5>
            <span><i class="bi bi-calendar"></i> ${date}</span>
        </div>`;
    return div;
}

function loadTags() {
    const container = document.getElementById('tags-container');
    const tags = new Set();
    blogPosts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
    container.innerHTML = '';
    tags.forEach(tag => {
        const el = document.createElement('a');
        el.href = '#';
        el.className = 'tag';
        el.textContent = tag;
        el.dataset.tag = tag;
        container.appendChild(el);
    });
}

function setupEventListeners() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMorePosts);

    const searchInput = document.getElementById('blog-search');
    if (searchInput) searchInput.addEventListener('input', handleSearch);

    document.addEventListener('click', e => {
        if (e.target.closest('[data-category]')) {
            e.preventDefault();
            filterByCategory(e.target.closest('[data-category]').dataset.category);
        }
        if (e.target.closest('[data-tag]')) {
            e.preventDefault();
            filterByTag(e.target.closest('[data-tag]').dataset.tag);
        }
    });
}

function loadMorePosts() {
    const container = document.getElementById('blog-posts-container');
    const currentCount = container.children.length;
    blogPosts.slice(currentCount, currentCount + 3)
        .forEach(post => container.appendChild(createBlogPostElement(post)));
    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    const container = document.getElementById('blog-posts-container');
    const btn = document.getElementById('load-more-btn');
    if (container.children.length >= blogPosts.length && btn) btn.style.display = 'none';
}

function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    if (term.length < 2) return loadBlogPosts();
    const filtered = blogPosts.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term) ||
        p.tags.some(t => t.toLowerCase().includes(term))
    );
    displayFilteredPosts(filtered);
}

function filterByCategory(category) {
    const filtered = blogPosts.filter(p => p.category === category);
    displayFilteredPosts(filtered);
}

function filterByTag(tag) {
    const filtered = blogPosts.filter(p => p.tags.includes(tag));
    displayFilteredPosts(filtered);
}

function displayFilteredPosts(posts) {
    const container = document.getElementById('blog-posts-container');
    const btn = document.getElementById('load-more-btn');
    container.innerHTML = '';
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search display-1 text-muted"></i>
                <h3 class="mt-3">No posts found</h3>
                <p class="text-muted">Try adjusting your search or filter criteria.</p>
            </div>`;
        if (btn) btn.style.display = 'none';
        return;
    }
    posts.forEach(p => container.appendChild(createBlogPostElement(p)));
    if (btn) btn.style.display = 'none';
}
