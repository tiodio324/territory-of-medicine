// Основной JavaScript файл для сайта "Территория медицины"

document.addEventListener('DOMContentLoaded', function() {
    
    // Плавная прокрутка для якорных ссылок
    const smoothScroll = function(target, duration) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;
        
        const targetPosition = targetElement.offsetTop - 100;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    };
    
    // Обработчики для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            smoothScroll(target, 1000);
        });
    });
    
    // Слайдер галереи
    const initGallerySlider = function() {
        const sliders = document.querySelectorAll('.gallery__slider');
        
        sliders.forEach(slider => {
            const slides = slider.querySelectorAll('.gallery__slide');
            const dots = slider.querySelectorAll('.gallery__dot');
            const prevBtns = slider.querySelectorAll('.gallery__arrow--prev');
            const nextBtns = slider.querySelectorAll('.gallery__arrow--next');
            let currentSlide = 0;
            const getVisibleCount = function() {
                const track = slider.querySelector('.gallery__slides');
                if (!track) return 1;
                const trackWidth = track.clientWidth;
                const styles = window.getComputedStyle(track);
                const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;

                // Measure a slide width even if slides are hidden
                let measuredWidth = 0;
                for (let i = 0; i < slides.length; i++) {
                    const s = slides[i];
                    measuredWidth = s.getBoundingClientRect().width;
                    if (measuredWidth > 0) break;
                }
                if (measuredWidth === 0 && slides.length) {
                    const s = slides[0];
                    const prevDisplay = s.style.display;
                    const prevPosition = s.style.position;
                    const prevVisibility = s.style.visibility;
                    s.style.display = 'block';
                    s.style.position = 'absolute';
                    s.style.visibility = 'hidden';
                    measuredWidth = s.getBoundingClientRect().width || s.offsetWidth || 0;
                    s.style.display = prevDisplay;
                    s.style.position = prevPosition;
                    s.style.visibility = prevVisibility;
                }

                if (measuredWidth <= 0) return 1;

                const numerator = trackWidth + gap;
                const denominator = measuredWidth + gap;
                const count = Math.max(1, Math.floor(numerator / denominator));
                return Math.min(count, slides.length);
            };
            let visibleCount = getVisibleCount();
            
            const showSlide = function(index) {
                slides.forEach((slide) => {
                    slide.style.display = 'none';
                });
                for (let offset = 0; offset < visibleCount; offset++) {
                    const showIndex = (index + offset) % slides.length;
                    const slide = slides[showIndex];
                    if (slide) slide.style.display = 'block';
                }
                dots.forEach((dot, i) => {
                    dot.classList.toggle('gallery__dot--active', i === index);
                });
            };
            
            const nextSlide = function() {
                const maxStart = Math.max(0, slides.length - visibleCount);
                currentSlide = (currentSlide + 1) % (slides.length);
                if (currentSlide > maxStart) currentSlide = 0;
                showSlide(currentSlide);
            };
            
            const prevSlide = function() {
                const maxStart = Math.max(0, slides.length - visibleCount);
                currentSlide = (currentSlide - 1 + (maxStart + 1)) % (maxStart + 1);
                showSlide(currentSlide);
            };
            
            // Обработчики для точек
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    currentSlide = index;
                    showSlide(currentSlide);
                });
            });
            
            // Обработчики для стрелок (мобильные и десктопные)
            prevBtns.forEach(btn => btn.addEventListener('click', prevSlide));
            nextBtns.forEach(btn => btn.addEventListener('click', nextSlide));
            
            // Автоматическое переключение слайдов
            setInterval(nextSlide, 5000);
            
            // Показываем первый слайд
            showSlide(0);

            // Обновляем число видимых слайдов при ресайзе
            const recalcOnResize = () => {
                const newCount = getVisibleCount();
                if (newCount !== visibleCount) {
                    visibleCount = newCount;
                    showSlide(currentSlide);
                }
            };
            window.addEventListener('resize', recalcOnResize);
            window.addEventListener('orientationchange', recalcOnResize);
        });
    };
    
    // Анимация появления элементов при скролле
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.service-card, .stats__item, .gallery__slide');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1
        });
        
        elements.forEach(element => {
            observer.observe(element);
        });
    };
    
    // Обработка формы поиска
    const initSearch = function() {
        const searchInput = document.querySelector('.header__search-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    // TODO: Добавить логику поиска
                    console.log('Поиск:', query);
                }
            }
        });
    };
    
    // Закрытие куки уведомления
    const initCookies = function() {
        const cookiesClose = document.querySelector('.cookies__close');
        const cookies = document.querySelector('.cookies');
        
        if (cookiesClose && cookies) {
            cookiesClose.addEventListener('click', function() {
                cookies.style.display = 'none';
                // Сохраняем в localStorage, чтобы не показывать снова
                localStorage.setItem('cookiesAccepted', 'true');
            });
            
            // Проверяем, было ли уже принято уведомление
            if (localStorage.getItem('cookiesAccepted')) {
                cookies.style.display = 'none';
            }
        }
    };
    
    // Адаптивное меню
    const initMobileMenu = function() {
        const mobileMenuBtn = document.querySelector('.header__mobile-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuOverlay = document.querySelector('.mobile-menu__overlay');
        const mobileMenuClose = document.querySelector('.mobile-menu__close');
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu__nav-link');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.style.display = 'block';
                document.body.classList.add('no-scroll');
                setTimeout(() => {
                    mobileMenu.classList.add('mobile-menu--open');
                }, 10);
            });
            
            const closeMenu = function() {
                mobileMenu.classList.remove('mobile-menu--open');
                document.body.classList.remove('no-scroll');
                setTimeout(() => {
                    mobileMenu.style.display = 'none';
                }, 300);
            };
            
            if (mobileMenuOverlay) {
                mobileMenuOverlay.addEventListener('click', closeMenu);
            }
            
            if (mobileMenuClose) {
                mobileMenuClose.addEventListener('click', closeMenu);
            }

            mobileMenuLinks.forEach(link => {
                link.addEventListener('click', function() {
                    closeMenu();
                });
            });
        }
    };
    
    // Плавное изменение прозрачности шапки при скролле
    const initHeaderScroll = function() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = 'var(--white)';
                header.style.backdropFilter = 'none';
            }
            
            lastScrollTop = scrollTop;
        });
    };

    // Функции для страницы Мероприятия
    const initEventsPage = function() {
        // Фильтры по времени
        const timeFilterBtns = document.querySelectorAll('.events__filter-btn');
        timeFilterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Убираем активный класс у всех кнопок
                timeFilterBtns.forEach(b => b.classList.remove('events__filter-btn--active'));
                // Добавляем активный класс к нажатой кнопке
                this.classList.add('events__filter-btn--active');
                
                // Здесь можно добавить логику фильтрации мероприятий
                const filterType = this.textContent.trim();
                console.log('Фильтр по времени:', filterType);
                
                // Пример: можно скрыть/показать карточки в зависимости от фильтра
                // filterEvents(filterType);
            });
        });

        // Фильтры по типу
        const typeFilterBtns = document.querySelectorAll('.events__type-btn');
        typeFilterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                typeFilterBtns.forEach(b => b.classList.remove('events__type-btn--active'));
                this.classList.add('events__type-btn--active');
                
                // TODO: Добавить логику фильтрации мероприятий
                const filterType = this.textContent.trim();
                console.log('Фильтр по типу: ', filterType);
            });
        });

        // Селекторы Месяц/Год
        const selectorBtns = document.querySelectorAll('.events__selector-btn');
        selectorBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const selectorType = this.textContent.trim();
                console.log('Селектор: ', selectorType);
                
                // TODO: Добавить логику для открытия календаря или выбора периода
                // openDateSelector(selectorType);
            });
        });

        // Кнопка "Показать ещё"
        const loadMoreBtn = document.querySelector('.events__load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                console.log('Загружаем ещё мероприятия...');
                
                // TODO: Добавить логику загрузки дополнительных мероприятий
                // loadMoreEvents();
            });
        }

        // Кнопки действий в карточках мероприятий
        const eventBtns = document.querySelectorAll('.events__btn');
        eventBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const btnText = this.textContent.trim();
                const card = this.closest('.events__card');
                const eventTitle = card.querySelector('.events__title').textContent;
                
                if (btnText === 'Зарегистрироваться') {
                    console.log('Регистрация на мероприятие:', eventTitle);
                } else if (btnText === 'Подробнее') {
                    console.log('Подробная информация о мероприятии:', eventTitle);
                }
            });
        });
    };

    // Функции для страницы карточки мероприятия
    const initEventPage = function() {
        // Галерея изображений
        const initEventGallery = function() {
            const gallery = document.querySelector('.event-gallery');
            if (!gallery) return;

            const thumbnails = gallery.querySelectorAll('.event-gallery__thumbnail');
            const currentImage = gallery.querySelector('.event-gallery__current-image');
            const dots = gallery.querySelectorAll('.event-gallery__dot');
            const prevBtn = gallery.querySelector('.event-gallery__arrow--prev');
            const nextBtn = gallery.querySelector('.event-gallery__arrow--next');
            
            let currentIndex = 0;
            const images = [
                'img/gallery-card_1.png',
                'img/gallery-card_2.png',
                'img/gallery-card_3.png',
                'img/gallery-card_1.png',
                'img/gallery-card_2.png',
                'img/gallery-card_3.png',
                'img/gallery-card_1.png',
                'img/gallery-card_2.png',
                'img/gallery-card_3.png',
                'img/gallery-card_1.png'
            ];

            const showImage = function(index) {
                if (currentImage && images[index]) {
                    currentImage.src = images[index];
                }
                
                // Обновляем активную точку
                dots.forEach((dot, i) => {
                    dot.classList.toggle('event-gallery__dot--active', i === index);
                });
                
                // Обновляем активную миниатюру
                thumbnails.forEach((thumb, i) => {
                    thumb.style.opacity = i === index ? '1' : '0.6';
                });
                
                currentIndex = index;
            };

            // Обработчики для миниатюр
            thumbnails.forEach((thumbnail, index) => {
                thumbnail.addEventListener('click', () => {
                    showImage(index);
                });
            });

            // Обработчики для точек
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showImage(index);
                });
            });

            // Обработчики для стрелок
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    const newIndex = (currentIndex - 1 + images.length) % images.length;
                    showImage(newIndex);
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    const newIndex = (currentIndex + 1) % images.length;
                    showImage(newIndex);
                });
            }

            showImage(0);
        };

        // Кнопка "Зарегистрироваться"
        const registerBtn = document.querySelector('.event-header__button');
        if (registerBtn) {
            registerBtn.addEventListener('click', function() {
                console.log('Регистрация на мероприятие');
                // TODO: Добавить логику регистрации
            });
        }

        // Кнопка "Читать ещё"
        const readMoreBtn = document.querySelector('.event-description__button');
        if (readMoreBtn) {
            readMoreBtn.addEventListener('click', function() {
                console.log('Показать полное описание');
                // TODO: Добавить логику показа полного описания
            });
        }

        // Инициализация галереи
        initEventGallery();
    };
    
    // Инициализация всех функций
    initGallerySlider();
    animateOnScroll();
    initSearch();
    initCookies();
    initMobileMenu();
    initHeaderScroll();
    initEventsPage();
    initEventPage();
    
    // Обработка ошибок загрузки изображений
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'img/placeholder.jpg';
            this.alt = 'Изображение недоступно';
        });
    });
    
    // Добавление класса для поддержки touch устройств
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // Ленивая загрузка изображений
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, _) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});
