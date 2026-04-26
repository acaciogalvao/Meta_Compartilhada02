import express from 'express';
// We just need the generator logic
function testGeneratePix(pixKey, amount, merchantName, merchantCity) {
      function formatPixKey(key) {
        let k = key.trim();
        // Email
        if (k.includes('@')) return k;
        // EVP (Random Key) - keep as is
        if (k.length === 36 && k.includes('-')) return k;
        
        const numeric = k.replace(/\D/g, '');
        
        // CNPJ
        if (numeric.length === 14) return numeric;
        
        // Exactly 11 digits could be CPF or Mobile Phone
        if (numeric.length === 11) {
          // Check if it's strictly a CPF format (xxx.xxx.xxx-xx or purely 11 digits)
          const isCpfFormat = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(k);
          // Alternatively, if it looks like a phone (e.g. has space, paren, or dash before 4 digits)
          const isPhoneFormat = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(k) || k.includes('+');
          
          if (isPhoneFormat && !isCpfFormat) {
            return `+55${numeric}`;
          }
          // Default to plain numeric for CPF or unformatted
          return numeric;
        }
        
        // Phone with country code but no '+' (e.g. 5511999999999)
        if (numeric.length === 12 || numeric.length === 13) {
          return `+${numeric}`;
        }
        
        // Fallback: strip spaces to make sure it doesn't break the BR Code format completely
        return k.replace(/\s+/g, '');
      }

      function getCRC16(payload) {
        let crc = 0xFFFF;
        for (let i = 0; i < payload.length; i++) {
          crc ^= payload.charCodeAt(i) << 8;
          for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) > 0) {
              crc = (crc << 1) ^ 0x1021;
            } else {
              crc = crc << 1;
            }
          }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
      }

  const formattedPixKey = formatPixKey(pixKey);

  const formatStr = (id, value) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const merchantAccountInfo = formatStr("00", "br.gov.bcb.pix") + formatStr("01", formattedPixKey);
  const cleanName = merchantName.substring(0, 25).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "");
  const cleanCity = merchantCity.substring(0, 15).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "");
  const amountStr = Number(amount).toFixed(2);
  
  let payload = 
    formatStr("00", "01") + 
    formatStr("01", "11") + 
    formatStr("26", merchantAccountInfo) + 
    formatStr("52", "0000") + 
    formatStr("53", "986") + 
    formatStr("54", amountStr) + 
    formatStr("58", "BR") + 
    formatStr("59", cleanName) + 
    formatStr("60", cleanCity) + 
    formatStr("62", formatStr("05", "***"));

  payload += "6304";
  const pixCode = payload + getCRC16(payload);

  return pixCode;
}

console.log(testGeneratePix("99984252028", 346.16, "Acacio", "Cidade"))
