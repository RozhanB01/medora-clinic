/* =========================================================
   MEDORA CLINIC
   JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    if (menuToggle && mainNav) {

        menuToggle.addEventListener("click", () => {
            mainNav.classList.toggle("open");
        });

        document.querySelectorAll(".nav-link, .nav-cta").forEach(link => {

            link.addEventListener("click", () => {
                mainNav.classList.remove("open");
            });

        });
    }


    /* =====================================================
       HEADER ON SCROLL
    ===================================================== */

    const header = document.getElementById("header");

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    updateHeader();

    window.addEventListener("scroll", updateHeader);


    /* =====================================================
       SMOOTH NAVIGATION
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            const headerHeight = header
                ? header.offsetHeight
                : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        });

    });


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    function updateActiveNav() {

        let currentSection = "";

        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 150;

            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute("id");
            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            const href =
                link.getAttribute("href");

            if (href === `#${currentSection}`) {
                link.classList.add("active");
            }

        });
    }

    window.addEventListener("scroll", updateActiveNav);

    updateActiveNav();


    /* =====================================================
       COUNTERS
    ===================================================== */

    const counters =
        document.querySelectorAll(".counter");

    let countersStarted = false;

    function formatNumber(number) {
        return number.toLocaleString("en-US");
    }

    function animateCounters() {

        if (countersStarted) {
            return;
        }

        const statsSection =
            document.querySelector(".stats");

        if (!statsSection) {
            return;
        }

        const rect =
            statsSection.getBoundingClientRect();

        if (rect.top < window.innerHeight - 100) {

            countersStarted = true;

            counters.forEach(counter => {

                const target =
                    Number(counter.dataset.target);

                const duration = 1600;
                const startTime = performance.now();

                function updateCounter(currentTime) {

                    const elapsed =
                        currentTime - startTime;

                    const progress =
                        Math.min(elapsed / duration, 1);

                    const eased =
                        1 - Math.pow(1 - progress, 3);

                    const currentValue =
                        Math.floor(target * eased);

                    counter.textContent =
                        formatNumber(currentValue);

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent =
                            formatNumber(target);
                    }
                }

                requestAnimationFrame(updateCounter);

            });

        }
    }

    window.addEventListener("scroll", animateCounters);

    animateCounters();


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(".reveal");

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });


    /* =====================================================
       FAQ ACCORDION
    ===================================================== */

    const faqItems =
        document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {

        const question =
            item.querySelector(".faq-question");

        const answer =
            item.querySelector(".faq-answer");

        if (!question || !answer) {
            return;
        }

        question.addEventListener("click", () => {

            const isOpen =
                item.classList.contains("open");

            faqItems.forEach(otherItem => {

                otherItem.classList.remove("open");

                const otherAnswer =
                    otherItem.querySelector(".faq-answer");

                if (otherAnswer) {
                    otherAnswer.style.maxHeight = null;
                }

            });

            if (!isOpen) {

                item.classList.add("open");

                answer.style.maxHeight =
                    answer.scrollHeight + "px";

            }

        });

    });


    /* =====================================================
       APPOINTMENT FORM
    ===================================================== */

    const appointmentForm =
        document.getElementById("appointmentForm");

    const formMessage =
        document.getElementById("formMessage");

    const dateInput =
        document.getElementById("date");


    /* Minimum date = today */

    if (dateInput) {

        const today =
            new Date();

        const year =
            today.getFullYear();

        const month =
            String(today.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(today.getDate())
                .padStart(2, "0");

        dateInput.min =
            `${year}-${month}-${day}`;
    }


    if (appointmentForm) {

        appointmentForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                if (!appointmentForm.checkValidity()) {

                    appointmentForm.reportValidity();

                    return;
                }

                const submitButton =
                    appointmentForm.querySelector(
                        ".form-button"
                    );

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.innerHTML =
                        "Sending request...";

                }

                setTimeout(() => {

                    if (formMessage) {

                        formMessage.textContent =
                            "Thank you! Your appointment request has been received.";

                    }

                    appointmentForm.reset();

                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.innerHTML =
                            'Request Appointment <span>→</span>';

                    }

                }, 1000);

            }
        );

    }


    /* =====================================================
       NEWSLETTER
    ===================================================== */

    const newsletterForms =
        document.querySelectorAll(".newsletter-form");

    newsletterForms.forEach(form => {

        form.addEventListener("submit", event => {

            event.preventDefault();

            const input =
                form.querySelector("input");

            if (!input) {
                return;
            }

            if (!input.value.trim()) {

                input.focus();

                return;
            }

            input.value = "";

            input.placeholder =
                "Thank you!";

        });

    });


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const currentYear =
        document.getElementById("currentYear");

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }

});