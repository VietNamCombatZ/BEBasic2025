const milisUtcToVnTime = 7 * 3600 * 1000;

export const GetCurrentDate = () => {
    const utc = new Date();
    const vtc = new Date( utc.getTime() + milisUtcToVnTime );
    return vtc;
}

export const GetTimeNow = () => {
    const time = GetCurrentDate();
    const now = time.setMinutes( time.getMinutes() );
    return now;
}