
import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

export default function App() {
  const [qrCode, setQrCode] = useState(null);
  const [data, setData] = useState('https://replit.com');
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [margin, setMargin] = useState(10);
  const [dotsType, setDotsType] = useState('dots');
  const [dotsColor, setDotsColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [useDotsGradient, setUseDotsGradient] = useState(false);
  const [dotsGradientType, setDotsGradientType] = useState('linear');
  const [dotsGradientColor1, setDotsGradientColor1] = useState('#000000');
  const [dotsGradientColor2, setDotsGradientColor2] = useState('#4267B2');
  const [dotsGradientRotation, setDotsGradientRotation] = useState(0);
  const [useBackgroundGradient, setUseBackgroundGradient] = useState(false);
  const [backgroundGradientType, setBackgroundGradientType] = useState('linear');
  const [backgroundGradientColor1, setBackgroundGradientColor1] = useState('#ffffff');
  const [backgroundGradientColor2, setBackgroundGradientColor2] = useState('#e9ebee');
  const [backgroundGradientRotation, setBackgroundGradientRotation] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [useProxy, setUseProxy] = useState(false);
  const [imageMargin, setImageMargin] = useState(5);
  const [imageSize, setImageSize] = useState(0.4);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('Q');
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const initialQrCode = new QRCodeStyling({
      width,
      height,
      type: "svg",
      data,
      margin,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel
      },
      dotsOptions: {
        type: dotsType,
        color: dotsColor
      },
      backgroundOptions: {
        color: backgroundColor
      },
      cornersSquareOptions: {
        type: "square",
        color: "#000000"
      },
      cornersDotOptions: {
        type: "square",
        color: "#000000"
      }
    });

    setQrCode(initialQrCode);
    
    // Clean up if needed
    return () => {};
  }, []);

  useEffect(() => {
    if (qrCode && canvasRef.current) {
      canvasRef.current.innerHTML = '';
      qrCode.append(canvasRef.current);
    }
  }, [qrCode]);

  const downloadQrCode = (format = 'svg') => {
    if (qrCode) {
      qrCode.download({
        extension: format,
        name: "qr-code"
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Clear the URL input when using file upload
      setImageUrl('');

      const reader = new FileReader();
      reader.onload = function(event) {
        updateQrCodeWithImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateQrCodeWithImage = (imageData) => {
    const options = createQrCodeOptions();
    
    if (imageData) {
      options.image = imageData;
      options.imageOptions = {
        margin: imageMargin,
        imageSize: imageSize,
        hideBackgroundDots: true
      };
    }

    const newQrCode = new QRCodeStyling(options);
    setQrCode(newQrCode);
  };

  const handleUrlImage = () => {
    if (imageUrl && imageUrl.trim() !== '') {
      // Function to convert URL to data URI
      const urlToDataURI = (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';

          img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const dataURI = canvas.toDataURL('image/png');
            resolve(dataURI);
          };

          img.onerror = function() {
            reject(new Error('Failed to load image'));
          };

          // Use CORS proxy if checkbox is checked
          img.src = useProxy ? `https://cors-anywhere.herokuapp.com/${url}` : url;
        });
      };

      urlToDataURI(imageUrl)
        .then(dataURI => {
          updateQrCodeWithImage(dataURI);
        })
        .catch(error => {
          console.error("Error converting image:", error);
          if (canvasRef.current) {
            canvasRef.current.innerHTML = "<div style='color:red;text-align:center;padding:20px;'>Failed to load image. Check URL and try again.</div>";
          }
        });
    }
  };

  const createQrCodeOptions = () => {
    const options = {
      width,
      height,
      type: "svg",
      data,
      margin,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel
      },
      cornersSquareOptions: {
        type: "square",
        color: "#000000"
      },
      cornersDotOptions: {
        type: "square",
        color: "#000000"
      }
    };

    // Handle dots options with gradient support
    if (useDotsGradient) {
      options.dotsOptions = {
        type: dotsType,
        gradient: {
          type: dotsGradientType,
          rotation: dotsGradientRotation,
          colorStops: [
            { offset: 0, color: dotsGradientColor1 },
            { offset: 1, color: dotsGradientColor2 }
          ]
        }
      };
    } else {
      options.dotsOptions = {
        type: dotsType,
        color: dotsColor
      };
    }

    // Handle background options with gradient support
    if (useBackgroundGradient) {
      options.backgroundOptions = {
        gradient: {
          type: backgroundGradientType,
          rotation: backgroundGradientRotation,
          colorStops: [
            { offset: 0, color: backgroundGradientColor1 },
            { offset: 1, color: backgroundGradientColor2 }
          ]
        }
      };
    } else {
      options.backgroundOptions = {
        color: backgroundColor
      };
    }

    return options;
  };

  const updateQrCode = () => {
    const options = createQrCodeOptions();
    const newQrCode = new QRCodeStyling(options);
    setQrCode(newQrCode);
  };

  // Handle file upload button click
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // Reset image function
  const resetImage = () => {
    setImageUrl('');
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const options = createQrCodeOptions();
    const newQrCode = new QRCodeStyling(options);
    setQrCode(newQrCode);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">QR Code Generator</h1>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Left Side - Controls */}
            <div className="md:w-2/3 p-4 overflow-y-auto max-h-[80vh]">
              {/* Basic Options */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">Basic Options</h2>
                
                <div className="mb-4">
                  <label htmlFor="data" className="block text-gray-700 font-medium mb-1">QR Code Content</label>
                  <textarea 
                    id="data" 
                    className="w-full p-2 border rounded"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="width" className="block text-gray-700 font-medium mb-1">Width</label>
                    <input 
                      type="number" 
                      id="width" 
                      className="w-full p-2 border rounded"
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value))}
                      min="100"
                      max="1000"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="height" className="block text-gray-700 font-medium mb-1">Height</label>
                    <input 
                      type="number" 
                      id="height" 
                      className="w-full p-2 border rounded"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value))}
                      min="100"
                      max="1000"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="margin" className="block text-gray-700 font-medium mb-1">Margin</label>
                    <input 
                      type="number" 
                      id="margin" 
                      className="w-full p-2 border rounded"
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
              
              {/* Dots Options */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">Dots Options</h2>
                
                <div className="mb-4">
                  <label htmlFor="dotsType" className="block text-gray-700 font-medium mb-1">Dots Type</label>
                  <select 
                    id="dotsType" 
                    className="w-full p-2 border rounded"
                    value={dotsType}
                    onChange={(e) => setDotsType(e.target.value)}
                  >
                    <option value="square">Square</option>
                    <option value="dots">Dots</option>
                    <option value="rounded">Rounded</option>
                    <option value="classy">Classy</option>
                    <option value="classy-rounded">Classy Rounded</option>
                    <option value="extra-rounded">Extra Rounded</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center text-gray-700 font-medium">
                    <input 
                      type="checkbox" 
                      className="mr-2 h-5 w-5"
                      checked={useDotsGradient}
                      onChange={(e) => setUseDotsGradient(e.target.checked)}
                    />
                    Use Gradient
                  </label>
                </div>
                
                {!useDotsGradient ? (
                  <div className="mb-4">
                    <label htmlFor="dotsColor" className="block text-gray-700 font-medium mb-1">Color</label>
                    <input 
                      type="color" 
                      id="dotsColor" 
                      className="w-full h-10 p-1 border rounded"
                      value={dotsColor}
                      onChange={(e) => setDotsColor(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="dotsGradientType" className="block text-gray-700 font-medium mb-1">Gradient Type</label>
                      <select 
                        id="dotsGradientType" 
                        className="w-full p-2 border rounded"
                        value={dotsGradientType}
                        onChange={(e) => setDotsGradientType(e.target.value)}
                      >
                        <option value="linear">Linear</option>
                        <option value="radial">Radial</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="dotsGradientRotation" className="block text-gray-700 font-medium mb-1">Rotation</label>
                      <input 
                        type="number" 
                        id="dotsGradientRotation" 
                        className="w-full p-2 border rounded"
                        value={dotsGradientRotation}
                        onChange={(e) => setDotsGradientRotation(parseInt(e.target.value))}
                        min="0"
                        max="360"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="dotsGradientColor1" className="block text-gray-700 font-medium mb-1">Color 1</label>
                      <input 
                        type="color" 
                        id="dotsGradientColor1" 
                        className="w-full h-10 p-1 border rounded"
                        value={dotsGradientColor1}
                        onChange={(e) => setDotsGradientColor1(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="dotsGradientColor2" className="block text-gray-700 font-medium mb-1">Color 2</label>
                      <input 
                        type="color" 
                        id="dotsGradientColor2" 
                        className="w-full h-10 p-1 border rounded"
                        value={dotsGradientColor2}
                        onChange={(e) => setDotsGradientColor2(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Background Options */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">Background Options</h2>
                
                <div className="mb-4">
                  <label className="flex items-center text-gray-700 font-medium">
                    <input 
                      type="checkbox" 
                      className="mr-2 h-5 w-5"
                      checked={useBackgroundGradient}
                      onChange={(e) => setUseBackgroundGradient(e.target.checked)}
                    />
                    Use Gradient
                  </label>
                </div>
                
                {!useBackgroundGradient ? (
                  <div className="mb-4">
                    <label htmlFor="backgroundColor" className="block text-gray-700 font-medium mb-1">Color</label>
                    <input 
                      type="color" 
                      id="backgroundColor" 
                      className="w-full h-10 p-1 border rounded"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="backgroundGradientType" className="block text-gray-700 font-medium mb-1">Gradient Type</label>
                      <select 
                        id="backgroundGradientType" 
                        className="w-full p-2 border rounded"
                        value={backgroundGradientType}
                        onChange={(e) => setBackgroundGradientType(e.target.value)}
                      >
                        <option value="linear">Linear</option>
                        <option value="radial">Radial</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="backgroundGradientRotation" className="block text-gray-700 font-medium mb-1">Rotation</label>
                      <input 
                        type="number" 
                        id="backgroundGradientRotation" 
                        className="w-full p-2 border rounded"
                        value={backgroundGradientRotation}
                        onChange={(e) => setBackgroundGradientRotation(parseInt(e.target.value))}
                        min="0"
                        max="360"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="backgroundGradientColor1" className="block text-gray-700 font-medium mb-1">Color 1</label>
                      <input 
                        type="color" 
                        id="backgroundGradientColor1" 
                        className="w-full h-10 p-1 border rounded"
                        value={backgroundGradientColor1}
                        onChange={(e) => setBackgroundGradientColor1(e.target.value)}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="backgroundGradientColor2" className="block text-gray-700 font-medium mb-1">Color 2</label>
                      <input 
                        type="color" 
                        id="backgroundGradientColor2" 
                        className="w-full h-10 p-1 border rounded"
                        value={backgroundGradientColor2}
                        onChange={(e) => setBackgroundGradientColor2(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image Options */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">Image Options</h2>
                
                <div className="mb-4">
                  <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-1">Image URL</label>
                  <div className="flex">
                    <input 
                      type="text" 
                      id="imageUrl" 
                      className="flex-grow p-2 border rounded-l"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                    <button 
                      onClick={handleUrlImage}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-r"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">OR Upload Local Image</label>
                  <div className="flex items-center">
                    <input 
                      type="file"
                      ref={fileInputRef}
                      id="imageFile"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button 
                      onClick={handleFileButtonClick}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-l"
                    >
                      Choose File
                    </button>
                    <span className="flex-grow p-2 border-t border-r border-b rounded-r text-gray-500">
                      {imageFile ? imageFile.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
                
                {(imageUrl || imageFile) && (
                  <button 
                    onClick={resetImage}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-4"
                  >
                    Reset Image
                  </button>
                )}
                
                <div className="mb-4">
                  <label className="flex items-center text-gray-700 font-medium">
                    <input 
                      type="checkbox" 
                      className="mr-2 h-5 w-5"
                      checked={useProxy}
                      onChange={(e) => setUseProxy(e.target.checked)}
                    />
                    Use CORS proxy if direct image loading fails
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="imageMargin" className="block text-gray-700 font-medium mb-1">Margin</label>
                    <input 
                      type="number" 
                      id="imageMargin" 
                      className="w-full p-2 border rounded"
                      value={imageMargin}
                      onChange={(e) => setImageMargin(parseInt(e.target.value))}
                      min="0"
                      max="50"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="imageSize" className="block text-gray-700 font-medium mb-1">Size (0.0-1.0)</label>
                    <input 
                      type="number" 
                      id="imageSize" 
                      className="w-full p-2 border rounded"
                      value={imageSize}
                      onChange={(e) => setImageSize(parseFloat(e.target.value))}
                      min="0.0"
                      max="1.0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Error Correction Level */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">Error Correction Level</h2>
                
                <div className="mb-4">
                  <label htmlFor="errorCorrectionLevel" className="block text-gray-700 font-medium mb-1">Level</label>
                  <select 
                    id="errorCorrectionLevel" 
                    className="w-full p-2 border rounded"
                    value={errorCorrectionLevel}
                    onChange={(e) => setErrorCorrectionLevel(e.target.value)}
                  >
                    <option value="L">L - Low (7%)</option>
                    <option value="M">M - Medium (15%)</option>
                    <option value="Q">Q - Quartile (25%)</option>
                    <option value="H">H - High (30%)</option>
                  </select>
                </div>
              </div>
              
              </div>
            
            {/* Right Side - Preview */}
            <div className="md:w-1/3 bg-gray-100 p-4 flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold mb-6">QR Code Preview</h2>
              
              <div ref={canvasRef} className="bg-white p-4 rounded shadow-md inline-block"></div>
              
              <div className="mt-6 flex flex-col items-center">
                <div className="mb-3">
                  <select 
                    id="downloadFormat" 
                    className="p-2 border border-gray-300 rounded"
                    defaultValue="svg"
                  >
                    <option value="svg">SVG</option>
                    <option value="png">PNG</option>
                    <option value="jpeg">JPG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={updateQrCode}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded"
                  >
                    Update QR Code
                  </button>
                  <button 
                    onClick={(e) => {
                      const format = document.getElementById('downloadFormat').value;
                      downloadQrCode(format);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded"
                  >
                    Download QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-gray-600">
          <p>Powered by <a href="https://github.com/kozakdenys/qr-code-styling" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">QR Code Styling</a></p>
        </footer>
      </div>
    </div>
  );
}
