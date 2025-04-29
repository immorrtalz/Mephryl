import { Html, Head, Main, NextScript } from "next/document";

export default function Document()
{
	return (
		<Html lang="en">
			<Head>
				<title>Mephryl – Free image converter</title>
				<meta name='description' content='Open source, lightweight, fast and available in web'/>
				<meta name='viewport' content='width=device-width, initial-scale=1'/>
				<link rel='icon' href='./favicon.ico'/>
			</Head>
			<body>
				<Main/>
				<NextScript/>
			</body>
		</Html>
	);
}