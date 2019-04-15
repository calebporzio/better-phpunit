<?php

class CodeLensTest extends PHPUnit\Framework\TestCase
{
    // Const to be ignored by CodeLens
    public const NOT_A_METHOD = true;

    /**
     * Test with decorator.
     *
     * @test
     *
     * @return void
     */
    public function decorator()
    {
        $this->assertTrue(true);
    }

    public function test_first()
    {
        $this->assertTrue(true);
    }

    public function test_second()
    {
        $this->assertTrue(true);
    }

    public function not_a_test()
    {
        // This method does not have @test decorator nor starts with "test"
    }
}
