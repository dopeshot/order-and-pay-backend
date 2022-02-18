export const getStringOfLength = (length: number) =>
    new Array(length + 1).join('a');

export const getWrongId = () => '1aaaaaaaaaaaaaaaaaaaaaaa';

export const getMockAuthUser = () => ({
    userId: 'aaaaaaaaaaaaaaaaaaaccccc',
    username: 'User'
});

export const getUserSetupData = () => [
    {
        _id: getMockAuthUser().userId,
        status: 'unverified',
        role: 'user',
        password:
            '$2b$12$K9Ss9alRrTtXuroPxI8EOeFFmsP1R1cuX/li//qdDq3Dq/wEKRdt.',
        slug: 'heawdassdllo',
        email: 'teasdawdawst@gmail.de',
        username: 'Heawdassdllo'
    }
];
