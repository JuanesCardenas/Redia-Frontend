import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { Router } from '@angular/router'
import { AuthService } from '../../../core/services/auth.service'
import { AlertService } from '../../../core/services/alert.service'
import { NavbarComponent } from '../../../shared/navbar/navbar.component'
import { FooterComponent } from '../../../shared/footer/footer.component'
import { AuthResponse } from '../../../models/auth.model'

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

    email = ''
    password = ''
    showPassword = false

    constructor(
        private authService: AuthService,
        private router: Router,
        private alertService: AlertService
    ) { }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    login() {

        const data = {
            email: this.email,
            password: this.password
        }

        this.authService.login(data).subscribe({
            next: (res: AuthResponse) => {

                localStorage.setItem('accessToken', res.accessToken)
                localStorage.setItem('refreshToken', res.refreshToken)
                localStorage.setItem('role', res.role)
                localStorage.setItem('nombre', res.nombre)
                localStorage.setItem('telefono', res.telefono)
                localStorage.setItem('email', res.email)

                if (res.fotoUrl) {
                    localStorage.setItem('fotoUrl', res.fotoUrl)
                }

                if (res.role === 'ADMINISTRADOR') {
                    this.router.navigate(['/admin'])
                } else {
                    this.router.navigate(['/dashboard'])
                }

            },
            error: err => {
                this.alertService.error('Credenciales incorrectas')
                console.error(err)
            }
        })
    }

}