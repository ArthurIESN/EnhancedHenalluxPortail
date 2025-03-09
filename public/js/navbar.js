let dropdowns = document.querySelectorAll('.navbar .dropdown-toggler')
let dropdownIsOpen = false

function darkmode()
{
    const html = document.documentElement;
    const toggleButton = document.getElementById('toggleDarkMode');

    if (localStorage.getItem("theme") === "light") {
        html.setAttribute("data-theme", "light");
    }

    // Fonction pour basculer le mode
    toggleButton.addEventListener("click", async () =>
    {
        if (html.getAttribute("data-theme") === "dark")
        {
            html.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
        } else
        {
            html.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }

        if (typeof calendar !== 'undefined' && calendar != null) {
            await calendar.UpdateColors();
        }
    });
}

function closeBurgerMenu() {
    let navbarMenu = document.querySelector('.navbar-menu');
    if (navbarMenu.classList.contains('active')) {
        navbarMenu.classList.remove('active');
    }
}

// Handle dropdown menues
if (dropdowns.length) {
    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener('click', (event) => {
            let target = document.querySelector(`#${event.target.dataset.dropdown}`)

            if (target) {
                if (target.classList.contains('show')) {
                    target.classList.remove('show')
                    dropdownIsOpen = false
                } else {
                    target.classList.add('show')
                    dropdownIsOpen = true
                }
            }
        })
    })
}

// Handle closing dropdowns if a user clicked the body
window.addEventListener('mouseup', (event) => {
    if (dropdownIsOpen) {
        dropdowns.forEach((dropdownButton) => {
            let dropdown = document.querySelector(`#${dropdownButton.dataset.dropdown}`)
            let targetIsDropdown = dropdown == event.target

            if (dropdownButton == event.target) {
                return
            }

            if ((!targetIsDropdown) && (!dropdown.contains(event.target))) {
                dropdown.classList.remove('show')
            }
        })
    }
})

function handleSmallScreens() {
    document.querySelector('.navbar-toggler')
        .addEventListener('click', () => {
            let navbarMenu = document.querySelector('.navbar-menu')

            if (!navbarMenu.classList.contains('active')) {
                navbarMenu.classList.add('active')
            } else {
                navbarMenu.classList.remove('active')
            }
        })
}

darkmode();
handleSmallScreens()
