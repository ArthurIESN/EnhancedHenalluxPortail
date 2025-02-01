let dropdowns = document.querySelectorAll('.navbar .dropdown-toggler')
let dropdownIsOpen = false

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

handleSmallScreens()
