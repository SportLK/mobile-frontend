# SportLK — Team Architecture & Integration Guide

This guide defines the system architecture, integration boundaries, shared contracts, and Expo mobile setup for all **4 Members** of the SportLK development team.

---

## 1. Project Structure Overview

```
sportlk/
├── backend/                ← Shared NestJS + TypeORM + MySQL API (Port 3000)
├── sportlk-expo/           ← Shared Expo (React Native SDK 58) Mobile App
├── web-admin-frontend/     ← Shared Next.js Admin Portal (Port 3001)
├── mobile-frontend/        ← Legacy bare React Native (replaced by sportlk-expo)
└── TEAM_INTEGRATION_GUIDE.md
```

---

## 2. Member Responsibilities & Boundaries

| Member | Domain | Backend Scope | Mobile Frontend Scope | Web Admin Scope |
|---|---|---|---|---|
| **Member 1 (Current)** | **Community & User Management** | Auth (JWT), Users, Profiles, Roles, Role Applications, Community Feed, Posts, Comments, Likes, Reports, Notifications | Auth flow, Profile editing, Sports preferences, Feed, Post creation, Comments, Like/Report actions, Notifications, Role application, Workspace switching | User management, Account status/suspension, Moderation queue, Reports management, Role approvals |
| **Member 2** | **Team & Squad Management** | Teams, Team Members, Roster, Invitations, Join Requests, Challenges, Challenge Responses | Team creation, Team profile, Roster view, Invite players, Accept/decline invitations, Challenge teams | Team list, Team suspension, Member audit, Team-related reports |
| **Member 3** | **Tournament & Organizer Management** | Tournaments, Organizer Profiles, Tournament Registration, Brackets, Schedules | Browse tournaments, Register team, View bracket trees, Match schedule, Organizer dashboard | Organizer approvals, Tournament status, Sanctioning, Bracket audit |
| **Member 4** | **Match, Live Scores, Venues & Statistics** | Venues, Venue Booking, Fixtures, Matches, Match Events, Live Score WebSocket, Player/Team Statistics | Venue finder/details, Fixtures, Live score viewer (WebSocket), Match event timeline, Player stats | Venue management, Match official assignments, Result validation |

---

## 3. Expo Mobile App (`sportlk-expo`)

The mobile client has been migrated to **Expo SDK 58** with **Expo Router** and **TypeScript**.

### Running the App Locally:
```bash
cd sportlk-expo
npm install
npx expo start
```

### Options to test:
- **Physical Phone**: Install the **Expo Go** app from App Store / Google Play and scan the terminal QR code (ensure your phone is on the same Wi-Fi network and set `EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LOCAL_IP>:3000/api/v1` in `sportlk-expo/.env`).
- **Android Emulator**: Press `a` in the terminal. The default `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1` connects automatically to the backend on your host machine.
- **Web Browser**: Press `w` in the terminal to run in Chrome/Edge.

### Token Security:
Tokens are securely stored using `expo-secure-store` via `src/context/AuthContext.tsx`.

---

## 4. Backend Architecture & Member Integration Points

All members build within the single NestJS backend (`backend/src/`). Each member implements a dedicated module while reusing Member 1's authentication and user foundation.

### Shared Security & Decorators (Provided by Member 1)

Every member must protect authenticated routes using Member 1's guards:

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtUser } from '../common/auth.types';

@Controller('example')
@UseGuards(JwtAuthGuard)
export class ExampleController {
  @Get('me')
  getExample(@CurrentUser() user: JwtUser) {
    // user.id: string
    // user.email: string
    // user.roles: SportLKRole[] ('player' | 'team_manager' | 'organizer' | 'admin')
    return { userId: user.id, roles: user.roles };
  }
}
```

---

## 5. Implementation Blueprints for Other Members

### Member 2: Teams & Squad Management

**Backend Path:** `backend/src/teams/`

**Entities:**
- `Team`: `id`, `name`, `sport`, `city`, `logoUrl`, `description`, `status` ('active' | 'suspended'), `managerId` (FK -> `User.id`).
- `TeamMember`: `id`, `teamId` (FK -> `Team`), `userId` (FK -> `User`), `role` ('manager' | 'captain' | 'player'), `jerseyNumber`, `joinedAt`.
- `TeamInvitation`: `id`, `teamId`, `invitedUserId`, `status` ('pending' | 'accepted' | 'declined'), `createdById`.
- `TeamJoinRequest`: `id`, `teamId`, `applicantUserId`, `message`, `status` ('pending' | 'accepted' | 'declined').
- `TeamChallenge`: `id`, `challengerTeamId`, `challengedTeamId`, `sport`, `scheduledDate`, `venue`, `status` ('pending' | 'accepted' | 'declined' | 'completed').

**API Endpoints:**
```
POST   /api/v1/teams                     (Create team - requires 'team_manager' role)
GET    /api/v1/teams                     (Search/filter teams by sport, city)
GET    /api/v1/teams/:id                 (Team profile & roster)
PATCH  /api/v1/teams/:id                 (Update team details)
GET    /api/v1/teams/:id/members         (Team roster)
POST   /api/v1/teams/:id/invitations     (Invite player to team)
GET    /api/v1/teams/my-invitations      (Player checks received invitations)
POST   /api/v1/teams/:id/join            (Player submits join request)
POST   /api/v1/teams/challenges          (Challenge another team)
PATCH  /api/v1/teams/challenges/:id      (Accept/decline challenge)
```

**Integration with Member 1:**
- Roles: Users become team managers through Member 1's `/api/v1/role-applications`.
- Notifications: When an invitation or challenge is created, call Member 1's `NotificationsService.send(...)` to notify the target user.

---

### Member 3: Tournament & Organizer Management

**Backend Path:** `backend/src/tournaments/`

**Entities:**
- `Tournament`: `id`, `name`, `sport`, `description`, `rules`, `organizerId` (FK -> `User`), `format` ('knockout' | 'round_robin' | 'group_stage'), `minTeams`, `maxTeams`, `startDate`, `endDate`, `status` ('draft' | 'open_for_registration' | 'ongoing' | 'completed' | 'cancelled').
- `TournamentRegistration`: `id`, `tournamentId` (FK -> `Tournament`), `teamId` (FK -> Member 2's `Team`), `status` ('pending' | 'approved' | 'rejected'), `registeredAt`.
- `TournamentBracket`: `id`, `tournamentId`, `round`, `matchNumber`, `team1Id`, `team2Id`, `winnerId`, `nextMatchId`.

**API Endpoints:**
```
GET    /api/v1/tournaments               (List active tournaments)
POST   /api/v1/tournaments               (Create tournament - requires 'organizer' role)
GET    /api/v1/tournaments/:id           (Tournament details)
PATCH  /api/v1/tournaments/:id           (Update tournament details)
POST   /api/v1/tournaments/:id/register  (Register a team - requires team manager)
GET    /api/v1/tournaments/:id/teams     (Registered teams)
GET    /api/v1/tournaments/:id/bracket   (Bracket tree data)
POST   /api/v1/tournaments/:id/generate-bracket (Auto-seed tournament matches)
```

**Integration with Member 1 & 2:**
- Organizers are approved via Member 1's role application system.
- Registrations tie into Member 2's `teams` entity.

---

### Member 4: Match, Live Score, Venues & Statistics

**Backend Path:** `backend/src/matches/` and `backend/src/venues/`

**Entities:**
- `Venue`: `id`, `name`, `address`, `city`, `sportsSupported` (JSON array), `latitude`, `longitude`, `hourlyRate`, `status`.
- `Match`: `id`, `sport`, `tournamentId` (nullable FK), `homeTeamId` (FK -> `Team`), `awayTeamId` (FK -> `Team`), `venueId` (FK -> `Venue`), `startTime`, `status` ('scheduled' | 'live' | 'finished' | 'postponed'), `homeScore`, `awayScore`.
- `MatchEvent`: `id`, `matchId`, `minute`, `eventType` ('goal' | 'wicket' | 'point' | 'card' | 'substitution'), `teamId`, `playerId`, `details` (JSON).
- `PlayerStatistic`: `id`, `playerId`, `sport`, `matchesPlayed`, `goalsOrRuns`, `assistsOrWickets`, `mvpCount`.

**WebSocket Gateway for Live Scores:**
Install packages in backend:
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

```typescript
// backend/src/matches/matches.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/live', cors: { origin: '*' } })
export class MatchesGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe_match')
  handleJoinMatch(client: Socket, matchId: string) {
    client.join(`match_${matchId}`);
  }

  broadcastScoreUpdate(matchId: string, payload: any) {
    this.server.to(`match_${matchId}`).emit('score_updated', payload);
  }
}
```

**Mobile Live Score Consumer (in `sportlk-expo`):**
Install `socket.io-client` in `sportlk-expo`:
```bash
npx expo install socket.io-client
```

---

## 6. Database Migration & Entity Registration

When adding new entities, register them in `backend/src/app.module.ts`:

```typescript
TypeOrmModule.forRootAsync({
  // ...
  entities: [
    User,
    UserProfile,
    CommunityPost,
    CommunityComment,
    CommunityLike,
    RoleApplication,
    Report,
    Notification,
    // Add Member 2 entities: Team, TeamMember, TeamInvitation, TeamChallenge...
    // Add Member 3 entities: Tournament, TournamentRegistration...
    // Add Member 4 entities: Venue, Match, MatchEvent, PlayerStatistic...
  ],
  synchronize: true, // TypeORM synchronizes tables in development automatically
})
```

---

## 7. Git Workflow & Collaboration Rules

1. **Main Branch Protection**: `main` must always be runnable and buildable (`npm run build` passing in both backend and web-admin, `npx tsc --noEmit` passing in sportlk-expo).
2. **Branching Scheme**:
   - `member-1/user-community`
   - `member-2/team-management`
   - `member-3/tournament-management`
   - `member-4/matches-venues-stats`
3. **Module Isolation**: Do not edit another member's module files directly. Import their exported services or communicate via events/notifications.
