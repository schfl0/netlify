const inputTitle = document.getElementById('title');
const inputBody = document.getElementById('body');
const btnAdd = document.getElementById('btn-add');
const dataDiv = document.getElementById('data-div');
let ul;

btnAdd.addEventListener('click', input);

getData();

function getData() {
	if (ul === document.getElementById('ul')) {
		ul.remove();
	}
	fetch(
		'https://objective-carson-cc2bca.netlify.app/.netlify/functions/database'
	)
		.then((response) => response.json())
		.then((data) => {
			ul = document.createElement('ul');
			ul.setAttribute('id', 'ul');
			data.forEach((data) => {
				let li = document.createElement('li');
				li.setAttribute('data-id', data._id);
				let p = document.createElement('p');
				p.innerText = `Title: ${data.title} /`;
				let span = document.createElement('span');
				span.innerText = ` Body: ${data.body} `;
				let btnDelete = document.createElement('button');
				btnDelete.innerText = 'Delete';
				btnDelete.addEventListener('click', () => deleteData(data._id));
				p.appendChild(span);
				li.appendChild(p);
				li.appendChild(btnDelete);
				ul.appendChild(li);
				dataDiv.appendChild(ul);
			});
		});
}
function input() {
	let dataTitle = inputTitle.value;
	let dataBody = inputBody.value;
	let dataInput = {
		title: dataTitle,
		body: dataBody
	};
	fetch(
		'https://objective-carson-cc2bca.netlify.app/.netlify/functions/database',
		{
			method: 'POST',
			body: JSON.stringify(dataInput)
		}
	)
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			getData();
		});
}

function deleteData(id) {
	console.log(id);
	fetch(
		`https://objective-carson-cc2bca.netlify.app/.netlify/functions/database?id=${id}`,
		{
			method: 'DELETE'
		}
	)
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			getData();
		});
}
