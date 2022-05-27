import "./index.scss";
import $ from "jquery";

$("#query").change((evt) => {
	console.log(evt.target.value);

	$.ajax({
		url: "/graphql",
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify({
			query: evt.target.value,
            variables: { }
		}),
		success: (resp) => {
			$("#response").html(JSON.stringify(resp));
		},
	});
});

console.log("Hello");
