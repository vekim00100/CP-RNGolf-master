class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
    }

    init() {
        // useful variables
        this.SHOT_VELOCITY_X = 200
        this.SHOT_VELOCITY_Y_MIN = 700
        this.SHOT_VELOCITY_Y_MAX = 1100

        // shot-related variables
        this.shotCount = 0
        this.successfulShots = 0
    }

    preload() {
        this.load.path = './assets/img/'
        this.load.image('grass', 'grass.jpg')
        this.load.image('cup', 'cup.jpg')
        this.load.image('ball', 'ball.png')
        this.load.image('wall', 'wall.png')
        this.load.image('oneway', 'one_way_wall.png')
    }

    create() {
        // add background grass
        this.grass = this.add.image(0, 0, 'grass').setOrigin(0)

        // add cup
        this.cup = this.physics.add.sprite(width / 2, height / 10, 'cup')
        this.cup.body.setCircle(this.cup.width / 4)
        this.cup.body.setOffset(this.cup.width / 4)
        this.cup.body.setImmovable(true)

        // add ball
        this.ball = this.physics.add.sprite(width / 2, height - height / 10, 'ball')
        this.ball.body.setCircle(this.ball.width / 2)
        this.ball.body.setCollideWorldBounds(true)
        this.ball.body.setBounce(0.5)
        this.ball.body.setDamping(true).setDrag(0.5)

        // add walls
        let wallA = this.physics.add.sprite(0, height / 4, 'wall')
        wallA.setX(Phaser.Math.Between(0 + wallA.width/2, width - wallA.width/2))
        wallA.body.setImmovable(true)

        let wallB = this.physics.add.sprite(0, height / 2, 'wall')
        wallB.setX(Phaser.Math.Between(0 + wallB.width/2, width - wallB.width/2))
        wallB.body.setImmovable(true)

        this.walls = this.add.group([wallA, wallB])

        // add moving obstacle
        this.movingObstacle = this.physics.add.sprite(width / 2, height / 3, 'wall')
        this.movingObstacle.body.setImmovable(true)
        this.movingObstacle.body.setVelocityX(2)

        // check for screen edges and reverse direction
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject === this.movingObstacle) {
                // reverse direction when hitting screen edges
                this.movingObstacle.body.velocity.x *= -1
            }
        })

        // add one-way
        this.oneWay = this.physics.add.sprite(width/2, height/4*3, 'oneway')
        this.oneWay.setX(Phaser.Math.Between(0 +this.oneWay.width/2, width - this.oneWay.width/2))
        this.oneWay.body.setImmovable(true)
        this.oneWay.body.checkCollision.down = false

        // add pointer input
        this.input.on('pointerdown', (pointer) => {
            this.shotCount++

            let shotDirection = pointer.x <= this.ball.x ? -1 : 1
            // let shotDirection = pointer.y <= this.ball.y ? 1 : -1
            this.ball.body.setVelocityX(shotDirection * Phaser.Math.Between(this.SHOT_VELOCITY_X / 2, this.SHOT_VELOCITY_X))
            this.ball.body.setVelocityY(Phaser.Math.Between(this.SHOT_VELOCITY_Y_MIN, this.SHOT_VELOCITY_Y_MAX))
            // this.ball.body.setVelocityX(Phaser.Math.Between(-this.SHOT_VELOCITY_X, this.SHOT_VELOCITY_X))
            // this.ball.body.setVelocityY(Phaser.Math.Between(this.SHOT_VELOCITY_Y_MIN, this.SHOT_VELOCITY_Y_MAX) * shotDirection)
        })

        // cup/ball collision
        this.physics.add.collider(this.ball, this.cup, (ball, cup) => {
            this.successfulShots++
            this.resetBall()
        })

        // ball/wall collision
        this.physics.add.collider(this.ball, this.walls)

        // ball/movable obstacle collision
        this.physics.add.collider(this.ball, this.movingObstacle)

        // ball/one-way collision
        this.physics.add.collider(this.ball, this.oneWay)
        
        // Create a text object to display the score
        this.scoreText = this.add.text(16, 16, '', { fontSize: '18px', fill: '#fff' })
    }

    update() {

        this.movingObstacle.x += this.movingObstacle.body.velocity.x
        // Check if the movable obstacle reached the screen edges
        if (this.movingObstacle.x - this.movingObstacle.width / 2 <= 0 || this.movingObstacle.x + this.movingObstacle.width / 2 >= width) {
            // Reverse the velocity to make it bounce
            this.movingObstacle.body.velocity.x *= -1
        }

         // Calculate successful shot percentage
         const percentage = (this.successfulShots / this.shotCount) * 100 || 0
    
         // Display shot count, successful shots, and percentage
         this.scoreText.setText(`Shots: ${this.shotCount}\nSuccessful Shots: ${this.successfulShots}\nSuccess Percentage: ${percentage.toFixed(2)}%`)

    }
    
    // Reset the ball to its initial position w/ velocity
    resetBall() {
    this.ball.x = width / 2
    this.ball.y = height - height / 10
    this.ball.body.setVelocity(0, 0)
    }
}

/*
CODE CHALLENGE
Try to implement at least 3/4 of the following features during the remainder of class (hint: each takes roughly 15 or fewer lines of code to implement):
[ ] Add ball reset logic on successful shot
[ ] Improve shot logic by making pointer’s relative x-position shoot the ball in correct x-direction
[ ] Make one obstacle move left/right and bounce against screen edges
[ ] Create and display shot counter, score, and successful shot percentage
*/