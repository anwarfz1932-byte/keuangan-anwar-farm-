
/**
 * Memformat angka ke Rupiah dengan format khusus:
 * - Prefix: Rp. 
 * - Akhiran: .000
 * - Pemisah ribuan: . (menggunakan locale id-ID)
 */
export const formatRupiah = (amount: number): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Gunakan Intl.NumberFormat untuk pemisah ribuan titik (.)
  const formatted = new Intl.NumberFormat('id-ID').format(absAmount);
  
  // Format: [Tanda Minus jika ada]Rp. [Angka].000
  return `${isNegative ? '-' : ''}Rp. ${formatted}.000`;
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};
