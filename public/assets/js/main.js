// ==========================================
// 移动端菜单切换
// ==========================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const nav = document.getElementById('nav');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // 点击导航链接后关闭菜单
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            nav.classList.remove('active');
        }
    });
}

// ==========================================
// 平滑滚动
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // 如果是 # 或者目标元素不存在，则不处理
        if (href === '#' || href === '#home') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// Header 滚动效果
// ==========================================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ==========================================
// 表单验证和提交
// ==========================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    
    const formSuccess = document.getElementById('formSuccess');

    // 验证函数
    function validateName() {
        const name = nameInput.value.trim();
        if (name === '') {
            showError(nameInput, nameError, '请输入您的姓名');
            return false;
        } else if (name.length < 2) {
            showError(nameInput, nameError, '姓名至少需要2个字符');
            return false;
        } else {
            clearError(nameInput, nameError);
            return true;
        }
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            showError(emailInput, emailError, '请输入您的邮箱');
            return false;
        } else if (!emailRegex.test(email)) {
            showError(emailInput, emailError, '请输入有效的邮箱地址');
            return false;
        } else {
            clearError(emailInput, emailError);
            return true;
        }
    }

    function validateMessage() {
        const message = messageInput.value.trim();
        if (message === '') {
            showError(messageInput, messageError, '请输入您的留言');
            return false;
        } else if (message.length < 10) {
            showError(messageInput, messageError, '留言至少需要10个字符');
            return false;
        } else {
            clearError(messageInput, messageError);
            return true;
        }
    }

    function showError(input, errorElement, message) {
        input.parentElement.classList.add('error');
        errorElement.textContent = message;
    }

    function clearError(input, errorElement) {
        input.parentElement.classList.remove('error');
        errorElement.textContent = '';
    }

    // 实时验证
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    messageInput.addEventListener('blur', validateMessage);

    nameInput.addEventListener('input', () => {
        if (nameInput.parentElement.classList.contains('error')) {
            validateName();
        }
    });

    emailInput.addEventListener('input', () => {
        if (emailInput.parentElement.classList.contains('error')) {
            validateEmail();
        }
    });

    messageInput.addEventListener('input', () => {
        if (messageInput.parentElement.classList.contains('error')) {
            validateMessage();
        }
    });

    // 表单提交
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 验证所有字段
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isMessageValid = validateMessage();

        if (isNameValid && isEmailValid && isMessageValid) {
            // 显示加载状态
            const submitBtn = contactForm.querySelector('.btn-submit');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';

            // 模拟表单提交（实际项目中这里会发送到服务器）
            setTimeout(() => {
                // 隐藏加载状态
                submitBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoading.style.display = 'none';

                // 显示成功消息
                formSuccess.style.display = 'flex';

                // 重置表单
                contactForm.reset();

                // 3秒后隐藏成功消息
                setTimeout(() => {
                    formSuccess.style.display = 'none';
                }, 5000);

                // 输出表单数据到控制台（用于调试）
                console.log('表单提交成功:', {
                    name: nameInput.value,
                    email: emailInput.value,
                    message: messageInput.value,
                    timestamp: new Date().toISOString()
                });
            }, 1500);
        } else {
            // 滚动到第一个错误字段
            const firstError = contactForm.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

// ==========================================
// 页面加载动画
// ==========================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ==========================================
// 观察元素进入视口（可选的滚动动画）
// ==========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 为需要动画的元素添加观察
document.querySelectorAll('.about-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ==========================================
// 控制台欢迎信息
// ==========================================
console.log('%c欢迎访问我的网站！', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%c这是一个使用纯 HTML、CSS 和 JavaScript 构建的静态网站', 'color: #764ba2; font-size: 14px;');

