'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // 移动端菜单切换
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('nav');

    if (mobileMenuToggle && nav) {
      const handleMenuToggle = () => {
        mobileMenuToggle.classList.toggle('active');
        nav.classList.toggle('active');
      };

      mobileMenuToggle.addEventListener('click', handleMenuToggle);

      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenuToggle.classList.remove('active');
          nav.classList.remove('active');
        });
      });

      const handleClickOutside = (e: MouseEvent) => {
        if (!nav.contains(e.target as Node) && !mobileMenuToggle.contains(e.target as Node)) {
          mobileMenuToggle.classList.remove('active');
          nav.classList.remove('active');
        }
      };

      document.addEventListener('click', handleClickOutside);

      return () => {
        mobileMenuToggle.removeEventListener('click', handleMenuToggle);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, []);

  useEffect(() => {
    const header = document.getElementById('header');
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (header) {
        if (currentScroll > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateName = (name: string) => {
    if (name === '') {
      return '请输入您的姓名';
    } else if (name.length < 2) {
      return '姓名至少需要2个字符';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
      return '请输入您的邮箱';
    } else if (!emailRegex.test(email)) {
      return '请输入有效的邮箱地址';
    }
    return '';
  };

  const validateMessage = (message: string) => {
    if (message === '') {
      return '请输入您的留言';
    } else if (message.length < 10) {
      return '留言至少需要10个字符';
    }
    return '';
  };

  const handleBlur = (field: 'name' | 'email' | 'message') => {
    let error = '';
    if (field === 'name') {
      error = validateName(formData.name);
    } else if (field === 'email') {
      error = validateEmail(formData.email);
    } else if (field === 'message') {
      error = validateMessage(formData.message);
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: 'name' | 'email' | 'message', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      let error = '';
      if (field === 'name') {
        error = validateName(value);
      } else if (field === 'email') {
        error = validateEmail(value);
      } else if (field === 'message') {
        error = validateMessage(value);
      }
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const messageError = validateMessage(formData.message);

    setErrors({
      name: nameError,
      email: emailError,
      message: messageError
    });

    if (!nameError && !emailError && !messageError) {
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        setShowSuccess(true);
        setFormData({ name: '', email: '', message: '' });

        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);

        console.log('表单提交成功:', {
          ...formData,
          timestamp: new Date().toISOString()
        });
      }, 1500);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/css/style.css" />
      
      {/* Header 导航栏 */}
      <header className="header" id="header">
        <div className="container">
          <div className="nav-wrapper">
            <div className="logo">
              <Link href="/">我的网站</Link>
            </div>
            <nav className="nav" id="nav">
              <ul className="nav-list">
                <li><Link href="/" className="nav-link">首页</Link></li>
                <li><Link href="/#about" className="nav-link">关于</Link></li>
                <li><Link href="/contact" className="nav-link active">联系</Link></li>
              </ul>
            </nav>
            <button className="mobile-menu-toggle" id="mobileMenuToggle" aria-label="切换菜单">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Contact 联系区域 */}
      <section className="contact-section">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">联系我们</h1>
            <p className="section-subtitle">有任何问题或建议？我们很乐意听到您的声音</p>
          </div>

          <div className="contact-wrapper">
            <div className="contact-info">
              <h2>取得联系</h2>
              <p>填写表单，我们会尽快回复您。期待与您的交流！</p>
              
              <div className="info-items">
                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <h4>邮箱</h4>
                    <p>contact@mywebsite.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <h4>电话</h4>
                    <p>+86 123 4567 8900</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h4>地址</h4>
                    <p>中国，北京市，朝阳区</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className={`form-group ${errors.name ? 'error' : ''}`}>
                  <label htmlFor="name">姓名 <span className="required">*</span></label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    placeholder="请输入您的姓名"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    required
                  />
                  <span className="error-message">{errors.name}</span>
                </div>

                <div className={`form-group ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="email">邮箱 <span className="required">*</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    required
                  />
                  <span className="error-message">{errors.email}</span>
                </div>

                <div className={`form-group ${errors.message ? 'error' : ''}`}>
                  <label htmlFor="message">留言 <span className="required">*</span></label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={6} 
                    placeholder="请输入您的留言..."
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    required
                  ></textarea>
                  <span className="error-message">{errors.message}</span>
                </div>

                <button type="submit" className="btn btn-primary btn-submit" disabled={isLoading}>
                  <span className="btn-text" style={{ display: isLoading ? 'none' : 'block' }}>发送消息</span>
                  <span className="btn-loading" style={{ display: isLoading ? 'flex' : 'none' }}>
                    <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0110 10" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                    发送中...
                  </span>
                </button>

                {showSuccess && (
                  <div className="form-success">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <p>消息发送成功！我们会尽快回复您。</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer 页脚 */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>我的网站</h4>
              <p>打造优质的数字体验</p>
            </div>
            <div className="footer-section">
              <h4>快速链接</h4>
              <ul className="footer-links">
                <li><Link href="/">首页</Link></li>
                <li><Link href="/#about">关于</Link></li>
                <li><Link href="/contact">联系</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>关注我们</h4>
              <div className="social-links">
                <a href="#" aria-label="GitHub">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Twitter">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 我的网站. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

