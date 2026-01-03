'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';

export default function Home() {
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

      // 点击导航链接后关闭菜单
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenuToggle.classList.remove('active');
          nav.classList.remove('active');
        });
      });

      // 点击外部关闭菜单
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
    // 平滑滚动
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const handleAnchorClick = (e: Event) => {
      const current = e.currentTarget;
      if (!(current instanceof HTMLAnchorElement)) return;

      const href = current.getAttribute('href');
      if (!href) return;

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
    };

    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    // Header 滚动效果
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

    // 观察元素进入视口
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    document.querySelectorAll('.about-card').forEach(card => {
      (card as HTMLElement).style.opacity = '0';
      (card as HTMLElement).style.transform = 'translateY(20px)';
      (card as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });

    return () => {
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/assets/css/style.css" />
      
      {/* Header 导航栏 */}
      <header className="header" id="header">
        <div className="container">
          <div className="nav-wrapper">
            <div className="logo">
              <a href="#home">我的网站</a>
            </div>
            <nav className="nav" id="nav">
              <ul className="nav-list">
                <li><a href="#home" className="nav-link">首页</a></li>
                <li><a href="#about" className="nav-link">关于</a></li>
                <li><Link href="/contact" className="nav-link">联系</Link></li>
                <li><Link href="/login" className="nav-link">登录</Link></li>
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

      {/* Hero 区域 */}
      <section className="hero" id="home">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">欢迎来到我的世界</h1>
            <p className="hero-subtitle">探索创意、技术与设计的完美融合</p>
            <div className="hero-buttons">
              <a href="#about" className="btn btn-primary">了解更多</a>
              <Link href="/contact" className="btn btn-secondary">联系我</Link>
              <Link href="/login" className="btn btn-secondary">立即登录</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="300" fill="url(#gradient)"/>
                <circle cx="100" cy="100" r="60" fill="rgba(255,255,255,0.1)"/>
                <circle cx="300" cy="200" r="80" fill="rgba(255,255,255,0.1)"/>
                <path d="M50 250 Q200 150 350 250" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="400" y2="300">
                    <stop offset="0%" style={{stopColor:'#667eea', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#764ba2', stopOpacity:1}} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* About 关于区域 */}
      <section className="about about-compact" id="about">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">关于我们</h2>
            <p className="section-subtitle">致力于创造卓越的数字体验</p>
          </div>
          <div className="about-grid">
            <div className="about-card">
              <div className="card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3>创新设计</h3>
              <p>我们追求独特而富有创意的设计理念，为每个项目注入新鲜活力，打造令人难忘的视觉体验。</p>
            </div>
            <div className="about-card">
              <div className="card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3>响应式开发</h3>
              <p>采用最新的前端技术，确保网站在各种设备上都能完美呈现，提供流畅的用户体验。</p>
            </div>
            <div className="about-card">
              <div className="card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>快速交付</h3>
              <p>高效的工作流程和专业的团队协作，确保项目按时高质量完成，超越客户期望。</p>
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
                <li><a href="#home">首页</a></li>
                <li><a href="#about">关于</a></li>
                <li><Link href="/contact">联系</Link></li>
                <li><Link href="/login">登录</Link></li>
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
