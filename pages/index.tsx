import Head from 'next/head';
import { Poppins } from 'next/font/google';
import styles from '@/styles/Home.module.scss';
import Button from '@/components/Button';
import { LinkSVG, UploadSVG } from '@/components/SVGLibrary';
import { useEffect } from 'react';
import { ImageMagick, initializeImageMagick, Magick, MagickFormat } from '@imagemagick/magick-wasm';
import { isMagickInitialized, InitMagick } from '@/scripts/ImageMagickManager';

const poppins = Poppins(
{
	variable: '--font-poppins',
	subsets: ['latin', 'latin-ext'],
	weight: ['400', '500', '600']
});

export default function Home()
{
	InitMagick().then(() => console.log('ImageMagick initialized'));

	function selectFile(contentType : string = '.apng, .avif, .bmp, .dng, .eps, .gif, .hdr, .heic, .heif, .ico, .jpg, .jpeg, .png, .psd, .raw, .svg, .tga, .tif, .tiff, .webp', multiple : boolean = false)
	{
		var input = document.createElement('input');
		input.type = 'file';
		input.multiple = multiple;
		input.accept = contentType;
		input.id = 'imageInput';

		input.onchange = () =>
		{
			/* const imageInput = document.getElementById('imageInput') as HTMLInputElement; */

			if (input.files === undefined || input.files === null) return;

			var file = input.files[0];
			var reader = new FileReader();

			reader.onload = (e) =>
			{
				const result = (e.target!.result as string);

				// Определяем формат изображения по dataURL
				const isPng = result.startsWith('data:image/png');
				const isJpg = result.startsWith('data:image/jpeg') || result.startsWith('data:image/jpg');

				let targetFormat: MagickFormat = MagickFormat.Jpeg;
				let downloadMime = 'image/jpeg';
				let downloadExt = 'jpg';

				/* if (isJpg)
				{
					targetFormat = MagickFormat.Png;
					downloadMime = 'image/png';
					downloadExt = 'png';
				}
				else if (isPng)
				{
					targetFormat = MagickFormat.Jpeg;
					downloadMime = 'image/jpeg';
					downloadExt = 'jpg';
				} */

				targetFormat = MagickFormat.Gif;
				downloadMime = 'image/gif';
				downloadExt = 'gif';

				// Убираем префикс dataURL, оставляем только base64
				const base64Data = result.replace(/^data:.*;base64,/, '');

				// Преобразуем base64 в Uint8Array для ImageMagick.read
				const binaryString = atob(base64Data);
				const len = binaryString.length;
				const bytes = new Uint8Array(len);

				for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

				ImageMagick.read(bytes, image =>
				{
					image.write(targetFormat, data =>
					{
						const blob = new Blob([data], { type: downloadMime });
						const url = URL.createObjectURL(blob);

						const link = document.createElement('a');
						link.href = url;
						link.download = `converted-image.${downloadExt}`;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);

						URL.revokeObjectURL(url);
					});
				});
			};

			reader.readAsDataURL(file);
		};

		input.click();
	}

	return (
		<div className={`${styles.pageContainer} ${poppins.variable}`}>

			<header className={styles.header}>
				<svg width='202' height='47' viewBox='0 0 202 47' className={styles.logo} xmlns='http://www.w3.org/2000/svg'>
					<path d='M44.3509 4.03821e-06L38.208 34H30L34.167 11.2666L24.5 23H17.876L12.375 11.1706L8.208 34H0L6.30399 4.03821e-06H16L22.732 14.632L34.7029 4.03821e-06H44.3509Z'/>
					<path d='M61.0054 6.30661C64.4614 6.30661 67.1974 7.25061 69.2134 9.13861C71.2614 10.9946 72.2854 13.5386 72.2854 16.7706C72.2854 17.8266 72.2054 18.7706 72.0454 19.6026C71.9174 20.3386 71.7254 21.1226 71.4694 21.9546H52.8934C52.8614 22.1466 52.8454 22.4506 52.8454 22.8666C52.8454 24.2746 53.2294 25.3466 53.9974 26.0826C54.7654 26.8186 55.7894 27.1866 57.0694 27.1866L56 34C52.544 34 49.9334 32.8986 47.8534 30.9786C45.8054 29.0586 44.7814 26.4506 44.7814 23.1546C44.7814 22.1626 44.8774 21.1386 45.0694 20.0826C45.5494 17.2986 46.5414 14.8666 48.0454 12.7866C49.5494 10.7066 51.4214 9.10661 53.6614 7.98661C55.9014 6.86661 58.3494 6.30661 61.0054 6.30661ZM63.9814 17.7786C64.0454 17.3306 64.0774 17.0266 64.0774 16.8666C64.0774 15.5866 63.6774 14.6106 62.8774 13.9386C62.0774 13.2346 61.0214 12.8826 59.7094 12.8826C58.3014 12.8826 57.0534 13.3146 55.9654 14.1786C54.9094 15.0106 54.1414 16.2106 53.6614 17.7786H63.9814Z'/>
					<path d='M127.674 6.31C130.298 6.31 132.362 7.15461 133.866 8.65861C135.402 10.1626 136.17 12.2586 136.17 14.9466C136.17 15.8426 136.074 16.8026 135.882 17.8266L134.247 27H126.089L127.53 18.9306C127.939 16.6102 127.29 15.1066 126.522 14.3706C125.786 13.6346 124.746 13.46 123.402 13.46C121.802 13.46 120.458 13.7626 119.37 14.7546C118.282 15.7466 117.578 17.1386 117.258 18.9306L114.5 34H106.292L112.379 4.03821e-06H120.594L118.794 10.2426C119.85 9.05861 121.146 8.13061 122.682 7.45861C124.218 6.75461 125.882 6.31 127.674 6.31Z'/>
					<path d='M150.849 11.5386C152.097 9.93861 153.521 8.69061 155.121 7.79461C156.753 6.86661 158.449 6.31 160.209 6.31L158.673 15.0906H156.417C154.369 15.0906 152.753 15.5386 151.569 16.4346C150.385 17.2986 149.601 18.8346 149.217 21.0426L147.009 34H138.801L143.505 6.31H150L150.849 11.5386Z'/>
					<path d='M168.509 9.5L171 23.4426L180.565 6.31H189.445L165.685 46.24H156.853L164 35L161.5 21L168.509 9.5Z'/>
					<path d='M201.795 0L195.869 34H187.661L193.587 4.03821e-06L201.795 0Z'/>
					<path d='M86.1196 10.4826C87.1436 9.23461 88.4236 8.22661 89.9596 7.45861C91.5276 6.69061 93.2556 6.30661 95.1436 6.30661C98.0236 6.30661 100.344 7.25061 102.104 9.13861C103.896 11.0266 104.792 13.5866 104.792 16.8186C104.792 17.8106 104.696 18.8826 104.504 20.0346C104.024 22.7866 103.08 25.2186 101.672 27.3306C100.264 29.4106 98.5676 31.0266 96.5836 32.1786C94.5996 33.2986 92.708 34 90.5 34L89.0956 26.7066C90.7276 26.7066 92.2156 26.1146 93.5596 24.9306C94.9356 23.7146 95.8156 22.0826 96.1996 20.0346C96.2956 19.4906 96.3436 18.9946 96.3436 18.5466C96.3436 16.9466 95.8796 15.6986 94.9516 14.8026C94.0556 13.9066 92.9036 13.4586 91.4956 13.4586C89.8636 13.4586 88.3756 14.0506 87.0316 15.2346C85.6876 16.4186 85 18 84.2956 21.6666L82.7596 29.7306L79.8316 46.2426H71.6236L78.664 6.30661H85.4L86.1196 10.4826Z'/>
				</svg>

				<a className={`${styles.linkUnderLogo} colorWhite50 font14 bgBlur`}
					href='https://evermedia.immorrtalz.com'
					target='_blank'
					rel='noopener noreferrer'>
					by <span>EVERMEDIA PROJECT</span>
				</a>
			</header>

			<main className={styles.main}>
				<h1 className='fontSemibold'>Convert images for free</h1>
				<p className={`${styles.mainDescription} colorWhite50 font20`}>Supported formats are: PNG, JPG, WEBP, TIF and GIF</p>

				<div className={styles.buttonsContainer}>

					<Button
						title='Upload'
						svg={<UploadSVG className='fillWhite90'/>}
						onClick={selectFile}/>

					<Button
						isSquare='true'
						svg={<LinkSVG className='fillWhite90'/>}/>

				</div>

				<p className={`${styles.dragAndDropText} colorWhite50 font14`}>or just drag & drop them here</p>
				<p className='colorWhite50 font14'>This tool uses your hardware, so that is the only limitation.
This is why it's completely free.</p>
			</main>

			<footer className={styles.footer}>
				<p className={styles.footerItem}>© {new Date().getFullYear()}, EVERMEDIA PROJECT</p>
				<p className={styles.footerItem}>Made with 💜</p>
				<a className={styles.footerItem}
					href='https://github.com/immorrtalz/Mephryl'
					target='_blank'
					rel='noopener noreferrer'>
					View on GitHub
				</a>
			</footer>

		</div>
	);
}