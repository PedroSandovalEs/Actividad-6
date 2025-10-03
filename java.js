// ELEMENTOS
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const setPasswordButton = document.getElementById('setPasswordButton');
const nombreInput = document.getElementById('nombre');
const mensajeInput = document.getElementById('mensaje');
const imagenInput = document.getElementById('imagen');
const previewContainer = document.getElementById('previewContainer');
const previewImg = document.getElementById('previewImg');
const comentariosDiv = document.getElementById('comentarios');

// MODAL LOGIN 
window.addEventListener('load', () => {
  if (loginModal) loginModal.classList.add('show');
  const comentariosGuardados = JSON.parse(localStorage.getItem('comentarios')) || [];
  comentariosGuardados.forEach(c => mostrarComentario(c));
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const password = document.getElementById('password').value;
  const storedPassword = localStorage.getItem('pagePassword') || 'Minion';
  if (password === storedPassword) {
    loginModal.classList.remove('show');
  } else {
    alert('❌ Contraseña incorrecta');
  }
});

// Cambio de Contraseña
setPasswordButton.addEventListener('click', () => {
  const nueva = prompt('Escribe la nueva contraseña (mínimo 4 caracteres):');
  if (nueva && nueva.trim().length >= 4) {
    localStorage.setItem('pagePassword', nueva);
    alert('✅ Contraseña cambiada con éxito');
  } else {
    alert('⚠️ La contraseña debe tener al menos 4 caracteres');
  }
});

//  Previsualizar la foto
imagenInput.addEventListener('change', function() {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
      previewContainer.style.display = 'block';
    }
    reader.readAsDataURL(this.files[0]);
  } else {
    previewContainer.style.display = 'none';
  }
});

//  Agrega un comentario 
async function agregarComentario() {
  const nombre = nombreInput.value.trim();
  const mensaje = mensajeInput.value.trim();

  if (nombre.length < 3) { alert('El nombre debe tener al menos 3 caracteres'); return; }
  if (mensaje.length === 0) { alert('Escribe un mensaje'); return; }
  if (mensaje.length > 200) { alert('El mensaje no puede exceder 200 caracteres'); return; }

  const fechaTexto = new Date().toLocaleString();
  const id = Date.now();
  let imagenData = null;

  if (imagenInput.files && imagenInput.files[0]) {
    try {
      imagenData = await leerImagen(imagenInput.files[0]);
    } catch (e) {
      alert('Error al leer la imagen');
      return;
    }
  }

  const comentario = { id, nombre, mensaje, fechaTexto, imagenData, likes: 0 };
  guardarYMostrar(comentario);

  nombreInput.value = '';
  mensajeInput.value = '';
  imagenInput.value = '';
  previewContainer.style.display = 'none';
}

// leer imagen
function leerImagen(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

// Guardar y mostrar
function guardarYMostrar(comentario) {
  const comentariosGuardados = JSON.parse(localStorage.getItem('comentarios')) || [];
  comentariosGuardados.push(comentario);
  localStorage.setItem('comentarios', JSON.stringify(comentariosGuardados));
  mostrarComentario(comentario);
}

// Ver comentario
function mostrarComentario({ id, nombre, mensaje, fechaTexto, imagenData, likes }) {
  const comentarioDiv = document.createElement('div');
  comentarioDiv.classList.add('comment');

  const content = document.createElement('div');
  content.innerHTML = `
    <strong>${escapeHtml(nombre)}</strong>
    <p>${escapeHtml(mensaje)}</p>
    <small>${fechaTexto}</small>
  `;
  if (imagenData) {
    const img = document.createElement('img');
    img.src = imagenData;
    content.appendChild(img);
  }

  // Botón de like
  const likeButton = document.createElement('button');
  likeButton.classList.add('like-button');
  likeButton.textContent = `👍 ${likes}`;
  likeButton.addEventListener('click', () => {
    const comentarios = JSON.parse(localStorage.getItem('comentarios')) || [];
    const index = comentarios.findIndex(c => c.id === id);
    if (index !== -1) {
      comentarios[index].likes = (comentarios[index].likes || 0) + 1;
      localStorage.setItem('comentarios', JSON.stringify(comentarios));
      likeButton.textContent = `👍 ${comentarios[index].likes}`;
    }
  });

  // Botón pa borrar
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('btn-delete');
  deleteBtn.textContent = '🗑️';
  deleteBtn.addEventListener('click', () => {
    if (confirm('¿Borrar este comentario?')) {
      const comentarios = JSON.parse(localStorage.getItem('comentarios')) || [];
      const nuevos = comentarios.filter(c => c.id !== id);
      localStorage.setItem('comentarios', JSON.stringify(nuevos));
      comentarioDiv.remove();
    }
  });

  comentarioDiv.appendChild(content);
  comentarioDiv.appendChild(likeButton);
  comentarioDiv.appendChild(deleteBtn);
  comentariosDiv.appendChild(comentarioDiv);
}

// Borrar todos los comentarios
function borrarComentarios() {
  if (confirm('¿Borrar todos los comentarios?')) {
    localStorage.removeItem('comentarios');
    comentariosDiv.innerHTML = '<h3>Comentarios</h3>';
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[s]));
}
