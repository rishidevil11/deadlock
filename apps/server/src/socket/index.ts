import { Server, Socket } from 'socket.io';

export function setupSocketHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Join a game room
        socket.on('join:game', (data: { matchId: string; teamId: string; userId: string }) => {
            socket.join(`match:${data.matchId}`);
            socket.join(`team:${data.teamId}`);

            socket.to(`match:${data.matchId}`).emit('player:joined', {
                matchId: data.matchId,
                teamId: data.teamId,
                userId: data.userId,
            });

            console.log(`User ${data.userId} joined match ${data.matchId}`);
        });

        // Leave game room
        socket.on('leave:game', (data: { matchId: string }) => {
            socket.leave(`match:${data.matchId}`);
        });

        // Code submission
        socket.on('submit:code', (data: { matchId: string; teamId: string; submissionId: string }) => {
            // Broadcast to all players in the match that a submission was made
            io.to(`match:${data.matchId}`).emit('submission:new', {
                matchId: data.matchId,
                teamId: data.teamId,
                submissionId: data.submissionId,
            });
        });

        // Submission result
        socket.on('submission:result', (data: {
            matchId: string;
            teamId: string;
            submissionId: string;
            passed: boolean;
        }) => {
            io.to(`match:${data.matchId}`).emit('submission:complete', data);

            // If passed, update game state (for DeadLock - tug of war movement)
            if (data.passed) {
                io.to(`match:${data.matchId}`).emit('game:update', {
                    matchId: data.matchId,
                    teamId: data.teamId,
                    event: 'correct_answer',
                });
            }
        });

        // Game state updates (for DeadLock tug-of-war)
        socket.on('game:progress', (data: { matchId: string; position: number }) => {
            io.to(`match:${data.matchId}`).emit('game:progress', data);
        });

        // Round start
        socket.on('round:start', (data: { matchId: string; roundNum: number; problemId: string }) => {
            io.to(`match:${data.matchId}`).emit('round:started', data);
        });

        // Round end
        socket.on('round:end', (data: { matchId: string; roundNum: number; winnerId?: string }) => {
            io.to(`match:${data.matchId}`).emit('round:ended', data);
        });

        // Match end
        socket.on('match:end', (data: { matchId: string; winnerId: string }) => {
            io.to(`match:${data.matchId}`).emit('match:ended', data);
        });

        // Chat message (team only)
        socket.on('chat:team', (data: { teamId: string; userId: string; message: string }) => {
            io.to(`team:${data.teamId}`).emit('chat:message', {
                type: 'team',
                ...data,
                timestamp: new Date().toISOString(),
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}
