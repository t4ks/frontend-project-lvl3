import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import jumbotron from './jumbotron';

const container = document.createElement('div');
container.classList.add('container');

container.appendChild(jumbotron());
document.body.appendChild(container);
