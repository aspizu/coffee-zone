create table account (
    id            serial primary key,
    username      text   not null unique,
    password_hash text   not null,
    email         text   not null unique,
    avatar        text   not null,
    status        text   not null,
    created_at    bigint not null,
    last_login_at bigint not null,
    role          text   not null,
    verification  text   not null,
    reset_token   text   not null
);

create table notification (
    id         serial  primary key,
    receiver   integer not null,
    content    text    not null,
    created_at bigint  not null,
    foreign key (receiver) references account (id)
);

create table board (
    id               serial primary key,
    name             text   not null unique,
    description      text   not null,
    create_post_role text   not null,
    created_at       bigint not null
);

create table post (
    id         serial  primary key,
    author     integer not null,
    board      integer not null,
    content    text    not null,
    created_at bigint  not null,
    foreign key (author) references account (id),
    foreign key (board) references board (id)
);

create table post_vote (
    voter integer not null,
    post  integer not null,
    vote  integer not null check (vote in (-1, 1)),
    primary key (voter, post),
    foreign key (voter) references account (id),
    foreign key (post) references post (id)
);

create table comment (
    id         serial  primary key,
    author     integer not null,
    post       integer not null,
    content    text    not null,
    created_at bigint  not null,
    foreign key (author) references account (id),
    foreign key (post) references post (id)
);

create table comment_vote (
    voter   integer not null,
    comment integer not null,
    vote   integer not null check (vote in (-1, 1)),
    primary key (voter, comment),
    foreign key (voter) references account (id),
    foreign key (comment) references comment (id)
);

create table reply (
    id         serial  primary key,
    author     integer not null,
    comment    integer not null,
    content    text    not null,
    created_at text    not null,
    foreign key (author) references account (id),
    foreign key (comment) references comment (id)
);

create table reply_vote (
    voter integer not null,
    reply integer not null,
    vote  integer not null check (vote in (-1, 1)),
    primary key (voter, reply),
    foreign key (voter) references account (id),
    foreign key (reply) references reply (id)
);
