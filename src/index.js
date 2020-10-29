import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import jumbotron from './jumbotron';

document.body.classList.add('d-flex', 'flex-column', 'min-vh-100');
document.body.appendChild(jumbotron());
